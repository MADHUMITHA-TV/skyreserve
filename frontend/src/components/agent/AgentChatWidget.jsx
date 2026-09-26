import { useEffect, useRef, useState } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Chip,
  CircularProgress,
  Divider,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import { sendAgentMessage } from "../../services/agentService";
import { askPolicyQuestion } from "../../services/policyService";
import { getApiErrorMessage } from "../../api/axios";

const BOOKING_GREETING = {
  role: "agent",
  text: "Hi! I'm the SkyReserve booking assistant. Tell me where you'd like to fly — e.g. \"book me a window seat to Chennai next Friday under ₹5000\".",
};

const SUPPORT_GREETING = {
  role: "agent",
  text: "Hi! Ask me anything about baggage, cancellation, or refund policy — e.g. \"can I carry a power bank in checked baggage?\"",
};

/**
 * One widget, two modes:
 *  - "booking": stateful multi-turn agent over /agent/chat (tool-use,
 *    confirmation-gated payments — everything built in earlier steps).
 *  - "support": stateless RAG Q&A over /support/chat — each question is
 *    independent, no conversationId, answers show which policy section
 *    they were grounded in.
 * Switching modes preserves both transcripts (kept in separate state),
 * so hopping back and forth doesn't lose either conversation.
 */
export default function AgentChatWidget() {
  const { isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("booking"); // "booking" | "support"

  // --- booking mode state ---
  const [bookingMessages, setBookingMessages] = useState([BOOKING_GREETING]);
  const [conversationId, setConversationId] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  // --- support mode state ---
  const [supportMessages, setSupportMessages] = useState([SUPPORT_GREETING]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);
  const messages = mode === "booking" ? bookingMessages : supportMessages;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Only booking-related, and only for logged-in users — the backend
  // requires auth anyway, but hiding it entirely for guests avoids a
  // confusing "please log in" loop inside the chat itself.
  if (!isAuthenticated) return null;

  async function handleBookingSend(overrides = {}) {
    setLoading(true);
    try {
      const result = await sendAgentMessage({ conversationId, ...overrides });

      setConversationId(result.conversationId);
      setBookingMessages((prev) => [...prev, { role: "agent", text: result.reply }]);
      setPendingAction(result.requiresConfirmation ? result.pendingAction : null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "The booking assistant hit a snag — try again."));
      setBookingMessages((prev) => [
        ...prev,
        { role: "agent", text: "Sorry, something went wrong on my end. Could you try that again?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSupportSend(question) {
    setLoading(true);
    try {
      const result = await askPolicyQuestion(question);
      setSupportMessages((prev) => [
        ...prev,
        { role: "agent", text: result.answer, sources: result.sources },
      ]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Support couldn't answer that — try again."));
      setSupportMessages((prev) => [
        ...prev,
        { role: "agent", text: "Sorry, something went wrong finding an answer. Could you try that again?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSendText() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    if (mode === "booking") {
      setBookingMessages((prev) => [...prev, { role: "user", text }]);
      handleBookingSend({ message: text });
    } else {
      setSupportMessages((prev) => [...prev, { role: "user", text }]);
      handleSupportSend(text);
    }
  }

  function handleConfirm(confirm) {
    setBookingMessages((prev) => [
      ...prev,
      { role: "user", text: confirm ? "✅ Confirmed" : "❌ Cancelled" },
    ]);
    handleBookingSend({ confirm });
  }

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}>
      {open && (
        <Paper
          elevation={6}
          sx={{
            width: 380,
            height: 520,
            mb: 2,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box sx={{ px: 2, py: 1.5, bgcolor: "primary.main", color: "primary.contrastText" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={600}>
                SkyReserve Assistant
              </Typography>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "inherit" }}>
                <Typography fontSize={16}>✕</Typography>
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ px: 1.5, pt: 1.5 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={mode}
              onChange={(e, next) => next && setMode(next)}
            >
              <ToggleButton value="booking">✈️ Book a flight</ToggleButton>
              <ToggleButton value="support">📋 Policy support</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            <Stack spacing={1.5}>
              {messages.map((m, i) => (
                <Box key={i} sx={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%" }}>
                  <Box
                    sx={{
                      bgcolor: m.role === "user" ? "primary.main" : "grey.100",
                      color: m.role === "user" ? "primary.contrastText" : "text.primary",
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    <Typography variant="body2">{m.text}</Typography>
                  </Box>

                  {m.sources?.length > 0 && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {m.sources.map((s, j) => (
                        <Chip
                          key={j}
                          size="small"
                          variant="outlined"
                          label={`${s.sectionTitle} (${s.relevance})`}
                          sx={{ fontSize: 10, height: 20 }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}

              {loading && (
                <Box sx={{ alignSelf: "flex-start" }}>
                  <CircularProgress size={18} />
                </Box>
              )}
            </Stack>
          </Box>

          {mode === "booking" && pendingAction && (
            <>
              <Divider />
              <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
                <Chip label={`Confirmation needed: ${pendingAction}`} size="small" color="warning" sx={{ flex: 1 }} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ px: 1.5, pb: 1.5 }}>
                <Button fullWidth variant="contained" color="success" disabled={loading} onClick={() => handleConfirm(true)}>
                  Confirm
                </Button>
                <Button fullWidth variant="outlined" color="inherit" disabled={loading} onClick={() => handleConfirm(false)}>
                  Cancel
                </Button>
              </Stack>
            </>
          )}

          {!(mode === "booking" && pendingAction) && (
            <>
              <Divider />
              <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={mode === "booking" ? "Type a message..." : "Ask about baggage, cancellation, refunds..."}
                  value={input}
                  disabled={loading}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendText();
                  }}
                />
                <IconButton color="primary" disabled={loading || !input.trim()} onClick={handleSendText}>
                  <Typography fontSize={18}>➤</Typography>
                </IconButton>
              </Stack>
            </>
          )}
        </Paper>
      )}

      <Fab color="primary" onClick={() => setOpen((v) => !v)} aria-label="assistant">
        <Typography fontSize={22}>{open ? "✕" : "💬"}</Typography>
      </Fab>
    </Box>
  );
}
