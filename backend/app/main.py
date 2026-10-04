import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from . import config, db, llm, scholar
from .routers import auth, experiment, explore, gaps, mentors, novelty, writer

log = logging.getLogger("research-mentor")


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init()
    if not config.OPENROUTER_API_KEY:
        log.warning("OPENROUTER_API_KEY is not set: AI features will return an error.")
    if not config.OPENALEX_API_KEY:
        log.warning("OPENALEX_API_KEY is not set: paper search will hit OpenAlex's tiny keyless daily limit.")
    yield


app = FastAPI(title="Research Mentor AI", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])
for r in (auth, explore, novelty, gaps, experiment, writer, mentors):
    app.include_router(r.router)


@app.exception_handler(llm.LLMError)
async def llm_error(_: Request, e: llm.LLMError):
    return JSONResponse({"detail": str(e)}, status_code=502)


@app.exception_handler(scholar.ScholarError)
async def scholar_error(_: Request, e: scholar.ScholarError):
    return JSONResponse({"detail": str(e)}, status_code=502)


@app.get("/api/health")
def health():
    return {"ok": True, "llm_configured": bool(config.OPENROUTER_API_KEY), "openalex_key_configured": bool(config.OPENALEX_API_KEY), "model": config.MODEL, "fast_model": config.FAST_MODEL}
