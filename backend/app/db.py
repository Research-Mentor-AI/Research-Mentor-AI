import sqlite3
from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS mentors (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL, bio TEXT DEFAULT '',
  expertise TEXT NOT NULL DEFAULT '[]', price INTEGER NOT NULL DEFAULT 0, rating REAL,
  slots TEXT NOT NULL DEFAULT '[]');
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id),
  mentor_id INTEGER NOT NULL REFERENCES mentors(id), date TEXT NOT NULL, slot TEXT NOT NULL,
  note TEXT DEFAULT '', created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(mentor_id, date, slot));
"""


def _conn():
    c = sqlite3.connect(config.DB_PATH, check_same_thread=False)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys=ON")
    return c


def init():
    c = _conn()
    c.executescript(SCHEMA)
    c.commit()
    c.close()


def run(sql, params=(), *, one=False, write=False):
    """Run one statement. Returns rows (or one row), or the new row id for writes."""
    c = _conn()
    try:
        cur = c.execute(sql, params)
        if write:
            c.commit()
            return cur.lastrowid
        rows = cur.fetchall()
        return (rows[0] if rows else None) if one else rows
    finally:
        c.close()
