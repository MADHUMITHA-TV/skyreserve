/**
 * agent.orchestrator.js
 *
 * The multi-turn loop behind POST /api/v1/agent/chat. Ties together:
 *   - agent.llm.js       (talks to Gemini)
 *   - agent.executor.js  (runs tools against your real services)
 *   - agent.tools.js      (SENSITIVE_TOOLS gate)
 *   - Prisma              (conversation state + tool-call audit log)
 *
 * CONFIRMATION GATING (requirement 6) IS ENFORCED HERE, NOT JUST IN THE
 * PROMPT. When the model wants to call a tool in SENSITIVE_TOOLS
 * (confirm_payment, cancel_booking), this file does NOT execute it. It
 * pauses, builds a confirmation message using REAL DATA fetched directly
 * from your services (not the model's own words, so the amount shown to
 * the user can't be a hallucination), and waits for the next request to
 * arrive with `confirm: true`. Only that explicit, structured flag —
 * not fuzzy "the user said yes" text-parsing — triggers execution.
 */

import prisma from "../../config/database.js";
import { callAgentLLM } from "./agent.llm.js";
import { executeTool } from "./agent.executor.js";
import { SENSITIVE_TOOLS } from "./agent.tools.js";
import { fetchPaymentById } from "../payment/payment.service.js";
import { fetchBookingById } from "../booking/booking.service.js";

const DECLINE_MESSAGES = ["cancel", "no", "stop", "don't", "dont", "nevermind", "never mind"];

/** Builds a confirmation prompt from real, freshly-fetched data — never
 * from the model's own generated text — so what the user sees before
 * agreeing to spend money is guaranteed accurate. */
async function buildConfirmationPrompt(toolName, args, ctx) {
  if (toolName === "confirm_payment") {
    const payment = await fetchPaymentById(args.payment_id);
    const booking = await fetchBookingById(payment.bookingId);
    if (booking.userId !== ctx.userId) {
      // Don't leak details of someone else's payment in a confirmation prompt.
      return { ok: false, message: "That payment doesn't belong to your account." };
    }
    return {
      ok: true,
      message:
        `Here's what I'm about to do: charge ₹${payment.amount} via ${payment.paymentMethod} ` +
        `to complete booking ${booking.bookingCode}. This can't be undone. ` +
        `Reply "confirm" to proceed, or "cancel" if you'd like to stop here.`
    };
  }

  if (toolName === "cancel_booking") {
    const booking = await fetchBookingById(args.booking_id);
    if (booking.userId !== ctx.userId && ctx.role !== "ADMIN") {
      return { ok: false, message: "That booking doesn't belong to your account." };
    }
    return {
      ok: true,
      message:
        `Just to confirm: you want to cancel booking ${booking.bookingCode} ` +
        `(status: ${booking.status})? Reply "confirm" to proceed, or "cancel" to keep it.`
    };
  }

  return { ok: true, message: "Please confirm you'd like to proceed." };
}

async function logToolCall({ conversationId, userId, toolName, input, output, status, errorMessage, durationMs }) {
  await prisma.agentToolCall.create({
    data: { conversationId, userId, toolName, input, output: output ?? undefined, status, errorMessage, durationMs }
  });
}

/** Runs one executed tool call end-to-end: call executor, time it, log it,
 * return the Gemini-shaped functionResponse part to append to history. */
async function runAndLogTool(fc, ctx, conversationId) {
  const start = Date.now();
  let output;
  let status = "SUCCESS";
  let errorMessage = null;

  try {
    output = await executeTool(fc.name, fc.args, ctx);
    if (output && output.success === false) {
      status = "ERROR";
      errorMessage = output.message ?? "Tool reported failure";
    }
  } catch (err) {
    status = "ERROR";
    errorMessage = err.message ?? "Unexpected error";
    output = { success: false, message: errorMessage };
  }

  const durationMs = Date.now() - start;

  await logToolCall({
    conversationId,
    userId: ctx.userId,
    toolName: fc.name,
    input: fc.args,
    output,
    status,
    errorMessage,
    durationMs
  });

  return { functionResponse: { name: fc.name, response: output, id: fc.id } };
}

/**
 * @param {{ userId: string, role: string }} ctx
 * @param {{ conversationId?: string, message?: string, confirm?: boolean }} input
 */
export async function runAgentChat(ctx, { conversationId, message, confirm }) {
  let conversation;

  if (conversationId) {
    conversation = await prisma.agentConversation.findUnique({ where: { id: conversationId } });
    if (!conversation) {
      return { error: "NOT_FOUND", message: "Conversation not found." };
    }
    if (conversation.userId !== ctx.userId) {
      return { error: "FORBIDDEN", message: "This conversation doesn't belong to you." };
    }
  } else {
    conversation = await prisma.agentConversation.create({ data: { userId: ctx.userId } });
  }

  let contents = conversation.historyJson ?? [];
  const pending = conversation.pendingActionJson ?? null;
  let resultingBookingId = conversation.resultingBookingId ?? null;

  // --- Resolve any pending confirmation first ---
  if (pending) {
    const userSaidNo =
      confirm === false || (typeof message === "string" && DECLINE_MESSAGES.includes(message.trim().toLowerCase()));

    if (confirm === true) {
      const fakeCall = { name: pending.toolName, args: pending.args, id: pending.functionCallId };
      const responsePart = await runAndLogTool(fakeCall, ctx, conversation.id);

      if (pending.toolName === "create_booking" && responsePart.functionResponse.response?.success) {
        resultingBookingId = responsePart.functionResponse.response.booking.id;
      }

      contents.push({ role: "user", parts: [responsePart] });
    } else if (userSaidNo) {
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: pending.toolName,
              response: { success: false, reason: "USER_DECLINED", message: "User chose not to proceed." },
              id: pending.functionCallId
            }
          }
        ]
      });
    } else {
      // Ambiguous — neither a clear confirm nor a clear decline. Don't
      // guess with an irreversible action; ask again instead.
      return {
        conversationId: conversation.id,
        reply: 'Just to be clear — should I go ahead? Reply "confirm" to proceed or "cancel" to stop.',
        requiresConfirmation: true,
        pendingAction: pending.toolName
      };
    }
  }

  if (typeof message === "string" && message.trim() && !(pending && confirm === true)) {
    contents.push({ role: "user", parts: [{ text: message.trim() }] });
  }

  const MAX_TURNS = 6;
  let finalReply = null;
  let pausedFor = null;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const { functionCalls, text, modelContent } = await callAgentLLM(contents);
    if (modelContent) contents.push(modelContent);

    if (functionCalls.length === 0) {
      finalReply = text ?? "Sorry, could you rephrase that?";
      break;
    }

    const sensitiveCall = functionCalls.find((fc) => SENSITIVE_TOOLS.has(fc.name));
    if (sensitiveCall) {
      const prompt = await buildConfirmationPrompt(sensitiveCall.name, sensitiveCall.args, ctx);
      if (!prompt.ok) {
        finalReply = prompt.message;
        break;
      }
      pausedFor = { toolName: sensitiveCall.name, args: sensitiveCall.args, functionCallId: sensitiveCall.id };
      finalReply = prompt.message;
      break;
    }

    const responseParts = [];
    for (const fc of functionCalls) {
      const part = await runAndLogTool(fc, ctx, conversation.id);
      if (fc.name === "create_booking" && part.functionResponse.response?.success) {
        resultingBookingId = part.functionResponse.response.booking.id;
      }
      responseParts.push(part);
    }
    contents.push({ role: "user", parts: responseParts });

    if (turn === MAX_TURNS - 1) {
      finalReply = "This is taking more steps than expected — want to continue, or start over with a simpler request?";
    }
  }

  await prisma.agentConversation.update({
    where: { id: conversation.id },
    data: {
      historyJson: contents,
      pendingActionJson: pausedFor,
      resultingBookingId
    }
  });

  return {
    conversationId: conversation.id,
    reply: finalReply,
    requiresConfirmation: Boolean(pausedFor),
    pendingAction: pausedFor?.toolName ?? null
  };
}