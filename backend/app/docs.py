"""Pull plain text out of an uploaded PDF or DOCX."""
import io, re
from fastapi import HTTPException

MAX_BYTES = 15 * 1024 * 1024
MAX_CHARS = 60000


def extract_text(name: str, data: bytes) -> str:
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File is too large (max 15 MB).")
    n = name.lower()
    try:
        if n.endswith(".pdf"):
            from pypdf import PdfReader
            text = "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(data)).pages)
        elif n.endswith(".docx"):
            import docx
            d = docx.Document(io.BytesIO(data))
            text = "\n".join(p.text for p in d.paragraphs)
        else:
            raise HTTPException(415, "Please upload a PDF or DOCX file.")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(422, "Could not read this file. Is it a valid, unprotected PDF or DOCX?")
    text = re.sub(r"[ \t]+", " ", text).strip()
    if len(text) < 500:
        raise HTTPException(422, "No readable text found. Scanned PDFs are not supported yet.")
    return text


def shorten(text: str) -> str:
    """Keep the start (abstract, intro) and the end (discussion, limitations, conclusion)."""
    if len(text) <= MAX_CHARS:
        return text
    return text[:22000] + "\n\n[... middle of the paper omitted ...]\n\n" + text[-(MAX_CHARS - 22000):]


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def quote_in_text(quote: str, text_norm: str) -> bool:
    q = norm(quote)
    return len(q) >= 25 and q in text_norm
