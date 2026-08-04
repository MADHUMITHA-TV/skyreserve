"""
Gemini version of the booking agent, using Google's Interactions API
(the current recommended Gemini API as of mid-2026, replacing the older
generate_content/chat pattern).

Same job as agent.py: Claude/Gemini decides which tool to call, we
execute it against your real SkyReserve API, feed the result back,
repeat until there's a final answer.
"""

import json
from google import genai

from config import settings
from tools import TOOLS, execute_tool
from skyreserve_client import SkyReserveClient

SYSTEM_PROMPT = """You are the SkyReserve booking assistant.

You help users search flights, lock seats, create bookings, and pay -
by calling the tools available to you. Rules you must follow:

1. Airport IDs, flight IDs, and seat IDs are internal database IDs -
   never city names or IATA codes. Always call search_airports first
   to resolve any city or airport the user mentions, then use the
   returned id field when calling search_flights.
2. Always lock a seat with lock_seat before calling create_booking.
3. Before calling create_payment or cancel_booking, briefly confirm
   the key details with the user in plain language.
4. If a tool call fails, explain the problem to the user in plain
   language - do not retry blindly more than once.
5. Keep responses concise and conversational, like a helpful airline
   agent - not a JSON dump of tool results.
"""


def _to_gemini_tools(tool_defs: list) -> list:
    """Convert our Anthropic-style tool schemas (input_schema) into the
    Interactions API's function-declaration shape (parameters)."""
    converted = []
    for t in tool_defs:
        converted.append(
            {
                "type": "function",
                "name": t["name"],
                "description": t["description"],
                "parameters": t["input_schema"],
            }
        )
    return converted


GEMINI_TOOLS = _to_gemini_tools(TOOLS)


class BookingAgentGemini:
    def __init__(self, jwt_token: str):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.sky_client = SkyReserveClient(jwt_token)

    async def run(self, user_message: str, history: list | None = None) -> dict:
        # We run in stateless mode (store=False) and carry the full
        # conversation ourselves in `history`, same shape main.py already
        # expects from the Anthropic version.
        if history:
            conversation = history[:]
            conversation.append(
                {"type": "user_input", "content": [{"type": "text", "text": user_message}]}
            )
        else:
            # Fold the system prompt into the first turn - the Interactions
            # API's dedicated system-instruction field varies by SDK version,
            # so this is the safest way to guarantee it's honored.
            conversation = [
                {
                    "type": "user_input",
                    "content": [
                        {"type": "text", "text": f"{SYSTEM_PROMPT}\n\nUser: {user_message}"}
                    ],
                }
            ]

        for _ in range(settings.MAX_AGENT_TURNS):
            interaction = self.client.interactions.create(
                model=settings.MODEL_NAME,
                store=False,
                input=conversation,
                tools=GEMINI_TOOLS,
            )

            for step in interaction.steps:
                conversation.append(step.model_dump())

            function_call_steps = [s for s in interaction.steps if s.type == "function_call"]

            if not function_call_steps:
                return {"reply": interaction.output_text, "history": conversation}

            for fc_step in function_call_steps:
                result = await execute_tool(self.sky_client, fc_step.name, fc_step.arguments)
                conversation.append(
                    {
                        "type": "function_result",
                        "name": fc_step.name,
                        "call_id": fc_step.id,
                        "result": [{"type": "text", "text": json.dumps(result, default=str)}],
                    }
                )

        return {
            "reply": "I wasn't able to finish that request in a reasonable number of steps - could you rephrase or simplify it?",
            "history": conversation,
        }