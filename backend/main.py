"""FastAPI skeleton for Research Mentor AI. Run: uvicorn main:app --reload --port 8000
Each endpoint matches a call in src/api/client.js. Replace the TODOs with your LLM / retrieval code,
then set VITE_USE_MOCK=false in the frontend .env."""
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Research Mentor AI")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])


class Login(BaseModel): email: str; password: str
class Signup(Login): name: str
class Problem(BaseModel): problem_statement: str
class GapsIn(BaseModel): gaps: list[dict]
class DraftIn(BaseModel): fields: dict[str, str]; sections: list[str]


@app.post("/api/auth/login")
def login(b: Login):
    # TODO: check the user in your database, return a real JWT
    raise HTTPException(501, "login not implemented")  # -> {"token": "...", "user": {"name": "...", "email": "..."}}

@app.post("/api/auth/signup")
def signup(b: Signup):
    raise HTTPException(501, "signup not implemented")

@app.post("/api/explore/analyze")
def explore(b: Problem):
    # TODO: LLM analysis + vector search (Chroma/FAISS) for related papers
    # -> {domain[], understanding, objectives[], questions[], datasets[], methodology, challenges[], contributions[],
    #     papers:[{title, publisher, year, date, similarity, type, citations, source}]}
    raise HTTPException(501, "explore not implemented")

@app.post("/api/gaps/detect")
async def gaps(file: UploadFile = File(...)):
    # TODO: extract text from the PDF/DOCX, ask the LLM for gaps
    # -> [{title, evidence, tone, impact, done, limit, improve, source, quotes[], plan{...}}]
    raise HTTPException(501, "gaps not implemented")

@app.post("/api/experiment/plan")
def plan(b: GapsIn):
    # -> {"<gap title>": {objective, methodology, datasets[], baselines[], metrics[], contribution}}
    raise HTTPException(501, "plan not implemented")

@app.post("/api/novelty/check")
def novelty(b: Problem):
    # -> {score:int, novel[], readiness:[[label, bool]], overlap: Paper[]}
    raise HTTPException(501, "novelty not implemented")

@app.post("/api/writer/draft")
def draft(b: DraftIn):
    # -> {"<section name>": "drafted text"}
    raise HTTPException(501, "draft not implemented")
