import ApiResponse from "../../utils/ApiResponse.js";
import prisma from "../../config/database.js";
import { retrieveRelevantChunks } from "./policy.retriever.js";
import { answerPolicyQuestion } from "../agent/agent.llm.js";

export const ask = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json(new ApiResponse(false, "Provide a question."));
    }

    const chunks = await retrieveRelevantChunks(question.trim(), 4);
    const answer = await answerPolicyQuestion(question.trim(), chunks);

    await prisma.policySupportLog.create({
      data: {
        userId: req.user.id,
        question: question.trim(),
        retrievedChunkIds: chunks.map((c) => c.id),
        answer
      }
    });

    return res.status(200).json(
      new ApiResponse(true, "OK", {
        answer,
        sources: chunks.map((c) => ({
          source: c.source,
          sectionTitle: c.sectionTitle,
          relevance: Math.round(c.score * 100) / 100
        }))
      })
    );
  } catch (err) {
    next(err);
  }
};