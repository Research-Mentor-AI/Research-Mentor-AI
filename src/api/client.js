// All backend calls live here. Features never call fetch() directly.
// Set VITE_API_URL and VITE_USE_MOCK=false in .env to switch from mock data to FastAPI.
import { mock } from './mock';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
let token = null;
export const setToken = (t) => { token = t; };

async function http(path, { method = 'GET', body, form } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, { method, headers, body: form || (body && JSON.stringify(body)) });
  if (!res.ok) { let m = res.statusText; try { m = (await res.json()).detail || m; } catch {} throw new Error(m); }
  return res.json();
}

export const api = {
  // POST /api/auth/login   {email, password}        -> {token, user:{name,email}}
  // POST /api/auth/signup  {name, email, password}  -> {token, user:{name,email}}
  auth: {
    login: (email, password) => USE_MOCK ? mock.login(email) : http('/api/auth/login', { method: 'POST', body: { email, password } }),
    signup: (name, email, password) => USE_MOCK ? mock.signup(name, email) : http('/api/auth/signup', { method: 'POST', body: { name, email, password } })
  },
  // POST /api/explore/analyze {problem_statement} -> {domain[], understanding, objectives[], questions[], datasets[], methodology, challenges[], contributions[], papers[]}
  explore: { analyze: (problemStatement) => USE_MOCK ? mock.analyze(problemStatement) : http('/api/explore/analyze', { method: 'POST', body: { problem_statement: problemStatement } }) },
  // POST /api/gaps/detect  multipart file -> Gap[]
  gaps: { detect: (file) => { if (USE_MOCK) return mock.detectGaps(); const form = new FormData(); form.append('file', file); return http('/api/gaps/detect', { method: 'POST', form }); } },
  // POST /api/experiment/plan {gaps: Gap[]} -> { [gapTitle]: Plan }
  experiment: { plan: (gaps) => USE_MOCK ? mock.plan(gaps) : http('/api/experiment/plan', { method: 'POST', body: { gaps } }) },
  // POST /api/novelty/check {problem_statement} -> {score, novel[], readiness[[label, ok]], overlap: Paper[]}
  novelty: { check: (problemStatement) => USE_MOCK ? mock.novelty() : http('/api/novelty/check', { method: 'POST', body: { problem_statement: problemStatement } }) },
  // POST /api/writer/draft {fields, sections[]} -> { [sectionName]: text }
  writer: { draft: (payload) => USE_MOCK ? mock.draft(payload) : http('/api/writer/draft', { method: 'POST', body: payload }) }
};
