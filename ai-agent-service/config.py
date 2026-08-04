import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Get this free at https://aistudio.google.com/apikey
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Your existing Node/Express SkyReserve backend
    SKYRESERVE_BASE_URL = os.getenv("SKYRESERVE_BASE_URL", "http://localhost:5000/api/v1")

    # Free-tier Gemini model good for function calling
    MODEL_NAME = os.getenv("MODEL_NAME", "gemini-3.6-flash")

    MAX_AGENT_TURNS = int(os.getenv("MAX_AGENT_TURNS", "6"))

settings = Settings()