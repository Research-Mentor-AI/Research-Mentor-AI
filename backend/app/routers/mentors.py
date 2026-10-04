import datetime as dt, json, sqlite3
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from .. import auth, config, db

router = APIRouter(prefix="/api", tags=["mentors"])


class BookIn(BaseModel):
    mentor_id: int
    date: str
    slot: str
    note: str = ""


class MentorIn(BaseModel):
    name: str
    role: str
    bio: str = ""
    expertise: list[str]
    price: int = 0
    rating: float | None = None
    slots: list[str] = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "05:00 PM"]


def mentor_out(r) -> dict:
    parts = r["name"].replace("Dr.", "").split()
    return {"id": r["id"], "name": r["name"], "role": r["role"], "bio": r["bio"], "expertise": json.loads(r["expertise"]), "price": r["price"],
            "rating": r["rating"], "slots": json.loads(r["slots"]), "initials": "".join(w[0] for w in parts[:2]).upper()}


def valid_date(s: str) -> dt.date:
    try:
        d = dt.date.fromisoformat(s)
    except ValueError:
        raise HTTPException(422, "Invalid date.")
    if not dt.date.today() <= d <= dt.date.today() + dt.timedelta(days=60):
        raise HTTPException(422, "Choose a date within the next 60 days.")
    return d


@router.get("/mentors")
def list_mentors(user: dict = Depends(auth.current_user)):
    return {"mentors": [mentor_out(r) for r in db.run("SELECT * FROM mentors ORDER BY id")]}


@router.get("/mentors/{mid}/slots")
def slots(mid: int, date: str, user: dict = Depends(auth.current_user)):
    valid_date(date)
    m = db.run("SELECT * FROM mentors WHERE id=?", (mid,), one=True)
    if not m:
        raise HTTPException(404, "Mentor not found.")
    taken = {r["slot"] for r in db.run("SELECT slot FROM bookings WHERE mentor_id=? AND date=?", (mid, date))}
    return {"slots": [{"time": s, "booked": s in taken} for s in json.loads(m["slots"])]}


@router.post("/bookings")
def book(b: BookIn, user: dict = Depends(auth.current_user)):
    valid_date(b.date)
    m = db.run("SELECT * FROM mentors WHERE id=?", (b.mentor_id,), one=True)
    if not m or b.slot not in json.loads(m["slots"]):
        raise HTTPException(404, "That mentor or time slot does not exist.")
    try:
        bid = db.run("INSERT INTO bookings(user_id,mentor_id,date,slot,note) VALUES (?,?,?,?,?)", (user["id"], b.mentor_id, b.date, b.slot, b.note.strip()[:500]), write=True)
    except sqlite3.IntegrityError:
        raise HTTPException(409, "Sorry, that slot was just taken. Please pick another time.")
    return {"id": bid, "mentor": m["name"], "date": b.date, "slot": b.slot}


@router.get("/bookings")
def my_bookings(user: dict = Depends(auth.current_user)):
    rows = db.run("SELECT b.id,b.date,b.slot,b.note,m.name AS mentor,m.role FROM bookings b JOIN mentors m ON m.id=b.mentor_id "
                  "WHERE b.user_id=? AND b.date>=? ORDER BY b.date,b.slot", (user["id"], dt.date.today().isoformat()))
    return {"bookings": [dict(r) for r in rows]}


@router.post("/admin/mentors")
def add_mentor(m: MentorIn, x_admin_key: str = Header("")):
    if not config.ADMIN_KEY or x_admin_key != config.ADMIN_KEY:
        raise HTTPException(403, "Admin key required.")
    mid = db.run("INSERT INTO mentors(name,role,bio,expertise,price,rating,slots) VALUES (?,?,?,?,?,?,?)",
                 (m.name, m.role, m.bio, json.dumps(m.expertise), m.price, m.rating, json.dumps(m.slots)), write=True)
    return {"id": mid}
