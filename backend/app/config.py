import os, secrets
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE = "https://openrouter.ai/api/v1"
MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-sonnet-5.5")
FAST_MODEL = os.getenv("OPENROUTER_FAST_MODEL", "anthropic/claude-haiku-4.5")
# OpenRouter checks your balance against the max tokens you ask for. Lower this if you have little credit.
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "6000"))
APP_URL = os.getenv("APP_URL", "http://localhost:5173")

OPENALEX_EMAIL = os.getenv("OPENALEX_EMAIL", "")
EXPLORE_POOL = int(os.getenv("EXPLORE_POOL", "40"))   # papers retrieved and scored per search

# If JWT_SECRET is missing a random one is used: logins reset on every restart.
JWT_SECRET = os.getenv("JWT_SECRET") or secrets.token_urlsafe(32)
JWT_DAYS = 7
DB_PATH = os.getenv("DB_PATH", "research_mentor.db")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]
ADMIN_KEY = os.getenv("ADMIN_KEY", "")
