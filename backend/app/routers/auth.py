import re
import sqlite3
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from .. import auth, db

router = APIRouter(prefix="/api/auth", tags=["auth"])
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class Login(BaseModel):
    email: str
    password: str


class Signup(Login):
    name: str


def _out(row) -> dict:
    return {"token": auth.make_token(row["id"]), "user": {"name": row["name"], "email": row["email"]}}


@router.post("/signup")
def signup(b: Signup):
    email, name = b.email.strip().lower(), b.name.strip()
    if not name:
        raise HTTPException(422, "Please enter your name.")
    if not EMAIL.match(email):
        raise HTTPException(422, "Please enter a valid email address.")
    if len(b.password) < 6:
        raise HTTPException(422, "Password must be at least 6 characters.")
    try:
        uid = db.run("INSERT INTO users(name,email,password_hash) VALUES (?,?,?)", (name, email, auth.hash_password(b.password)), write=True)
    except sqlite3.IntegrityError:
        raise HTTPException(409, "An account with this email already exists. Try logging in.")
    return _out({"id": uid, "name": name, "email": email})


@router.post("/login")
def login(b: Login):
    row = db.run("SELECT * FROM users WHERE email=?", (b.email.strip().lower(),), one=True)
    if not row or not auth.check_password(b.password, row["password_hash"]):
        raise HTTPException(401, "Incorrect email or password.")
    return _out(row)


@router.get("/me")
def me(user: dict = Depends(auth.current_user)):
    return {"user": {"name": user["name"], "email": user["email"]}}
