import os, tempfile
os.environ.update(DB_PATH=os.path.join(tempfile.mkdtemp(), "t.db"), ADMIN_KEY="admin", OPENROUTER_API_KEY="test", JWT_SECRET="s")
import pytest
from fastapi.testclient import TestClient
from app import llm, scholar
from app.main import app
from tests.fakes import fake_chat_json, fake_search_works


@pytest.fixture(scope="session")
def client():
    mp = pytest.MonkeyPatch()
    mp.setattr(llm, "chat_json", fake_chat_json)
    mp.setattr(scholar, "search_works", fake_search_works)
    with TestClient(app) as c:
        yield c
    mp.undo()


@pytest.fixture(scope="session")
def auth(client):
    r = client.post("/api/auth/signup", json={"name": "Riya Sharma", "email": "riya@x.com", "password": "secret1"})
    return {"Authorization": "Bearer " + r.json()["token"]}
