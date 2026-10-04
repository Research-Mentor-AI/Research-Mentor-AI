"""Offline demo: runs the real API with a FAKE LLM and FAKE paper index (no keys, no internet).
Used only to try the UI without an OpenRouter key.   python -m tests.fake_server"""
import os, tempfile
os.environ.setdefault("DB_PATH", os.path.join(tempfile.mkdtemp(), "demo.db"))
os.environ.setdefault("OPENROUTER_API_KEY", "fake")
os.environ.setdefault("ADMIN_KEY", "admin")
import uvicorn
from app import llm, scholar
from tests.fakes import fake_chat_json, fake_search_works

llm.chat_json = fake_chat_json
scholar.search_works = fake_search_works
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)
