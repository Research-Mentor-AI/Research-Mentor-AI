import os, secrets
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE = "https://openrouter.ai/api/v1"
MODEL = os.getenv("OPENROUTER_MODEL", "anthropic/claude-sonnet-5.5")
FAST_MODEL = os.getenv("OPENROUTER_FAST_MODEL", "anthropic/claude-haiku-4.5")
# OpenRouter checks your balance against the max tokens you ask for. Lower this if you have little credit.
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "4000"))
APP_URL = os.getenv("APP_URL", "http://localhost:5173")

# Since Feb 2026 OpenAlex needs a free API key for real use (keyless = about $0.10/day, with key = $1/day).
OPENALEX_API_KEY = os.getenv("OPENALEX_API_KEY", "")
EXPLORE_POOL = int(os.getenv("EXPLORE_POOL", "40"))   # papers retrieved and scored per search

# If JWT_SECRET is missing a random one is used: logins reset on every restart.
JWT_SECRET = os.getenv("JWT_SECRET") or secrets.token_urlsafe(32)
JWT_DAYS = 7
DB_PATH = os.getenv("DB_PATH", "research_mentor.db")
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()]
ADMIN_KEY = os.getenv("ADMIN_KEY", "")

# Output-token ceilings per AI call (about 2x what a normal answer needs). If an answer is ever cut off,
# llm.chat_json automatically retries once with double the ceiling, up to MAX_OUTPUT_TOKENS.
TOKENS = {"explore": 1800, "queries": 300, "rank": 700, "novelty": 2500, "gaps": 3800, "support": 1200, "experiment": 2800,
          "Abstract": 450, "Introduction": 650, "Literature Review": 800, "Methodology": 650, "Experimental Setup": 450,
          "Results": 550, "Conclusion": 400, "section_default": 600}
