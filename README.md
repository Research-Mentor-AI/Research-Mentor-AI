# Research Mentor AI

React (Vite) frontend + FastAPI backend skeleton.

## Run
```bash
npm install && npm run dev                          # frontend
cd backend && pip install fastapi uvicorn python-multipart && uvicorn main:app --reload   # backend
```
Copy `.env.example` to `.env`. The app uses mock data until you set `VITE_USE_MOCK=false`.

## Structure
```
src/
  App.jsx              shell, session (logged-in user), routing between features
  api/client.js        ONE place for every backend call (endpoint contracts in comments)
  api/mock.js          temporary fake responses, delete when the backend is live
  components/          Sidebar, shared UI (PageHero, Progress, StatStrip)
  features/            Dashboard, Explore, Gaps, Experiment, Novelty, Writer, Mentors, Help
  pages/               Landing, Auth (login/signup)
  data/                static mock data and nav items
backend/main.py        FastAPI endpoints with TODOs for the LLM
```
