// Every backend call lives here. Set VITE_API_URL in .env (default http://localhost:8000).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const KEY = 'rm-token';
let token = localStorage.getItem(KEY);

export const getToken = () => token;
export const setToken = (t) => { token = t; if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY); };

async function http(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: form || (body && JSON.stringify(body)) });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  if (res.status === 401 && token && !path.startsWith('/api/auth/login')) { setToken(null); window.dispatchEvent(new Event('rm-logout')); }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const d = (await res.json()).detail; msg = typeof d === 'string' ? d : 'Please check what you entered and try again.'; } catch { /* keep default */ }
    throw new Error(msg);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email, password) => http('/api/auth/login', { method: 'POST', body: { email, password } }),
    signup: (name, email, password) => http('/api/auth/signup', { method: 'POST', body: { name, email, password } }),
    me: () => http('/api/auth/me')
  },
  explore: {
    analyze: (problem) => http('/api/explore/analyze', { method: 'POST', body: { problem_statement: problem } }),
    more: (searchId, offset) => http(`/api/explore/papers?search_id=${encodeURIComponent(searchId)}&offset=${offset}&limit=5`)
  },
  novelty: { check: (problem) => http('/api/novelty/check', { method: 'POST', body: { problem_statement: problem } }) },
  gaps: { detect: (file) => { const form = new FormData(); form.append('file', file); return http('/api/gaps/detect', { method: 'POST', form }); } },
  experiment: { plan: (gaps) => http('/api/experiment/plan', { method: 'POST', body: { gaps } }) },
  writer: { draft: (payload) => http('/api/writer/draft', { method: 'POST', body: payload }) },
  mentors: {
    list: () => http('/api/mentors'),
    slots: (id, date) => http(`/api/mentors/${id}/slots?date=${date}`),
    book: (payload) => http('/api/bookings', { method: 'POST', body: payload }),
    mine: () => http('/api/bookings')
  }
};
