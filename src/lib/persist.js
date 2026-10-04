// Keeps a feature's results alive when the user switches to another page (and survives a reload).
import { useCallback, useState } from 'react';

const mem = new Map();
const P = 'rm:';

export function usePersist(key, initial) {
  const [value, setValue] = useState(() => {
    if (mem.has(key)) return mem.get(key);
    try { const s = sessionStorage.getItem(P + key); if (s !== null) { const v = JSON.parse(s); mem.set(key, v); return v; } } catch { /* ignore */ }
    return typeof initial === 'function' ? initial() : initial;
  });
  const set = useCallback((next) => setValue(prev => {
    const v = typeof next === 'function' ? next(prev) : next;
    mem.set(key, v);
    try { sessionStorage.setItem(P + key, JSON.stringify(v)); } catch { /* storage full: memory only */ }
    return v;
  }), [key]);
  return [value, set];
}

// Forget saved results. clearPersist('explore') clears only Explore; clearPersist() clears everything (logout).
export function clearPersist(prefix = '') {
  [...mem.keys()].filter(k => k.startsWith(prefix)).forEach(k => mem.delete(k));
  try { Object.keys(sessionStorage).filter(k => k.startsWith(P + prefix)).forEach(k => sessionStorage.removeItem(k)); } catch { /* ignore */ }
}
