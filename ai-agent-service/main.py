from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import BookingAgentGemini

app = FastAPI(title="SkyReserve AI Agent Service (Gemini)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # add your deployed frontend URL too
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list | None = None  # pass back the "history" from the previous response


class ChatResponse(BaseModel):
    reply: str
    history: list


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, authorization: str = Header(None)):
    """
    Same contract as the Anthropic version's /chat endpoint - the
    existing SkyReserve JWT goes in the Authorization header, and this
    service forwards it to your real Node backend for every tool call.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    jwt_token = authorization.removeprefix("Bearer ").strip()

    agent = BookingAgentGemini(jwt_token)
    result = await agent.run(req.message, req.history)
    return result


@app.get("/health")
async def health():
    return {"status": "ok"}