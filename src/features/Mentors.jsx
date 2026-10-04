import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Search, ShieldCheck, Star, Users, X } from 'lucide-react';
import { SectionLabel, PageHero } from '../components/ui';
import { api } from '../api/client';

const GUIDE = { what: 'Connects you with verified research mentors for feedback on your gap, experiment plan or paper draft.', steps: [['Browse mentors', 'Search by name or expertise.'], ['Add a slot', 'Pick a date and a time that suits you.'], ['Confirm your details', 'Say what you want help with and confirm.'], ['Meet your mentor', 'Get a review and clear next steps.']] };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const days = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return { iso: iso(d), day: d.getDate(), mon: d.toLocaleString('en', { month: 'short' }).toUpperCase(), wk: d.toLocaleString('en', { weekday: 'short' }), long: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) }; });

export function Mentors({ user, notify }) {
  const [mentors, setMentors] = useState(null); const [error, setError] = useState(''); const [bookings, setBookings] = useState([]);
  const [q, setQ] = useState(''); const [exp, setExp] = useState('All');
  const [mentor, setMentor] = useState(null); const [step, setStep] = useState('slot'); const [dateIdx, setDateIdx] = useState(0); const [slots, setSlots] = useState([]); const [slot, setSlot] = useState(null);
  const [note, setNote] = useState(''); const [busy, setBusy] = useState(false); const [formError, setFormError] = useState('');
  const dates = useMemo(days, []);
  const reload = () => api.mentors.mine().then(r => setBookings(r.bookings)).catch(() => {});
  useEffect(() => { api.mentors.list().then(r => setMentors(r.mentors)).catch(e => setError(e.message)); reload(); }, []);
  useEffect(() => { if (!mentor) return; setSlot(null); setSlots([]); api.mentors.slots(mentor.id, dates[dateIdx].iso).then(r => setSlots(r.slots)).catch(e => setFormError(e.message)); }, [mentor, dateIdx, dates]);

  const chips = ['All', ...new Set((mentors || []).flatMap(m => m.expertise))];
  const shown = (mentors || []).filter(m => (exp === 'All' || m.expertise.includes(exp)) && `${m.name} ${m.role} ${m.expertise.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  const open = (m) => { setMentor(m); setStep('slot'); setDateIdx(0); setNote(''); setFormError(''); };
  const confirm = async () => {
    setBusy(true); setFormError('');
    try { await api.mentors.book({ mentor_id: mentor.id, date: dates[dateIdx].iso, slot, note }); notify('Session booked.'); setMentor(null); reload(); }
    catch (e) { setFormError(e.message); if (/taken/.test(e.message)) setStep('slot'); } finally { setBusy(false); }
  };
  return <>
    <PageHero icon={Users} tone="rose" guide={GUIDE} chips={['Verified mentors', 'Add a slot', 'Gap, plan & draft reviews']} title="My mentors" description="Find a verified research mentor for gap, experiment-plan or draft review." />
    <div className="mentor-toolbar"><div className="search-box"><Search size={16} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search mentors or expertise..." /></div><div className="filter-chips">{chips.map(f => <button className={exp === f ? 'selected' : ''} onClick={() => setExp(f)} key={f}>{f}</button>)}</div></div>
    {error && <div className="panel error-box">{error}</div>}
    {mentors && !mentors.length && <div className="panel empty-state"><Users size={26} /><strong>No mentors available yet</strong><span>Mentors will appear here as soon as they join the platform.</span></div>}
    <div className="mentor-grid">{shown.map(m => <article className="mentor-card" key={m.id}><div className="mentor-avatar">{m.initials}</div><span className="verified"><ShieldCheck size={11} /> Verified</span><h3>{m.name}</h3><p>{m.role}</p><div className="rating">{m.rating != null && <><Star size={13} fill="currentColor" /> {m.rating} <span>· </span></>}<span>₹{m.price}/session</span></div><div className="mentor-tags">{m.expertise.map(e => <span key={e}>{e}</span>)}</div><div className="mentor-actions"><button className="secondary-btn" onClick={() => open(m)}><CalendarDays size={14} /> Add slot</button></div></article>)}</div>
    {mentors && mentors.length > 0 && !shown.length && <div className="panel empty-state"><span>No mentors match your search.</span></div>}
    <section className="upcoming panel"><div><SectionLabel>UPCOMING SESSIONS</SectionLabel><h3>{bookings.length ? `${bookings.length} upcoming session${bookings.length === 1 ? '' : 's'}` : 'No upcoming sessions yet'}</h3></div>
      {bookings.map(b => { const d = new Date(b.date + 'T00:00'); return <div className="upcoming-session" key={b.id}><div className="date-tile"><strong>{d.getDate()}</strong><span>{d.toLocaleString('en', { month: 'short' }).toUpperCase()}</span></div><div><strong>{b.mentor}</strong><span>{d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}, {b.slot}{b.note ? ` · ${b.note}` : ''}</span></div><CheckCircle2 size={18} /></div>; })}</section>
    {mentor && <div className="modal-overlay"><div className="booking-modal">
      <div className="modal-head"><div><SectionLabel>{step === 'slot' ? 'ADD A SLOT' : 'YOUR DETAILS'}</SectionLabel><h3>{mentor.name}</h3><p>₹{mentor.price}/session</p></div><button className="icon-button" onClick={() => setMentor(null)}><X size={18} /></button></div>
      {step === 'slot' ? <>
        <div className="date-strip">{dates.map((d, i) => <button key={d.iso} className={dateIdx === i ? 'selected' : ''} onClick={() => setDateIdx(i)}><small>{d.wk}</small><strong>{d.day}</strong><small>{d.mon}</small></button>)}</div>
        <div className="slot-label">Times on {dates[dateIdx].long}</div>
        <div className="slot-grid">{slots.map(s => <button key={s.time} disabled={s.booked} className={slot === s.time ? 'selected' : ''} onClick={() => setSlot(s.time)}>{s.booked ? `${s.time} · taken` : s.time}</button>)}</div>
        {formError && <p className="auth-error">{formError}</p>}
        <button className="primary-btn full" disabled={!slot} onClick={() => setStep('details')}>Add this slot <ArrowRight size={15} /></button></> : <>
        <div className="booking-summary"><strong>{mentor.name}</strong><span>{mentor.role}</span><span>{dates[dateIdx].long} · {slot} · 1 hour · ₹{mentor.price}</span></div>
        <div className="form-grid"><input value={user.name} readOnly aria-label="Name" /><input value={user.email} readOnly aria-label="Email" /></div>
        <textarea className="note-box" rows={3} maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="What would you like help with? (optional)" />
        {formError && <p className="auth-error">{formError}</p>}
        <button className="primary-btn full" disabled={busy} onClick={confirm}>{busy ? 'Booking…' : 'Confirm booking'}</button>
        <button className="text-btn full" onClick={() => setStep('slot')}>Back to slots</button></>}
    </div></div>}
  </>;
}
