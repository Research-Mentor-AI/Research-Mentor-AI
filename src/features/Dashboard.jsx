import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Copy, FileText, FlaskConical, Lightbulb, RefreshCw, Search, Sparkles, Target, Users, Wand2 } from 'lucide-react';
import { api } from '../api/client';

const starters = [
  'How can deep learning detect road accidents from CCTV footage?',
  'Can LLMs detect fake news in low-resource languages?',
  'How does AI tutoring change student learning outcomes?',
  'Can federated learning protect patient data across hospitals?'
];
const tools = [
  ['explore', 'Explore', 'Describe your idea and meet the papers closest to it.', Search, 'indigo'],
  ['novelty', 'Novelty check', 'Find out how new your idea really is.', Target, 'violet'],
  ['gaps', 'Research gaps', 'Upload a paper and see what it left open, with proof.', Lightbulb, 'amber'],
  ['experiment', 'Experiment plan', 'Turn chosen gaps into a plan you can run.', FlaskConical, 'teal'],
  ['writer', 'Draft paper', 'Get every section of your paper drafted.', FileText, 'sky']
];
const tips = [
  'Read the limitations and future-work sections first. That is where papers admit their gaps.',
  'A good problem statement names the task, the data and what is currently hard.',
  'Always run a simple baseline before your own model. Reviewers will ask for it.',
  'Report more than accuracy. Precision, recall and F1 show where a model fails.',
  'Write the abstract last. It is easy once the rest of the paper exists.'
];

export function Dashboard({ user, onNavigate, onStart, notify }) {
  const [text, setText] = useState(''); const [tip, setTip] = useState(0);
  const [b, setB] = useState({ task: '', data: '', hard: '' }); const [next, setNext] = useState(null);
  useEffect(() => { api.mentors.mine().then(r => setNext(r.bookings[0] || false)).catch(() => setNext(false)); }, []);
  const built = b.task.trim() ? `How can we ${b.task.trim().replace(/[?.]$/, '')}${b.data.trim() ? ` using ${b.data.trim()}` : ''}${b.hard.trim() ? `, especially when ${b.hard.trim()}` : ''}?` : '';
  const copy = () => { navigator.clipboard && navigator.clipboard.writeText(built); notify('Problem statement copied.'); };
  return <>
    <section className="dash-hero">
      <div className="dash-hero-txt">
        <span className="hero-badge"><Sparkles size={14} /> Hello, {user.name.split(' ')[0]}</span>
        <h2>What do you want to research?</h2>
        <p>Type an idea in your own words. We will help you shape it into a project.</p>
        <div className="hero-input"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && text.trim() && onStart(text)} placeholder="e.g. Detect accidents in low-quality CCTV video" /><button className="primary-btn" disabled={!text.trim()} onClick={() => onStart(text)}>Explore it <ArrowRight size={17} /></button></div>
        <div className="starters"><span>No idea yet? Try one:</span>{starters.map(s => <button key={s} onClick={() => onStart(s)}>{s}</button>)}</div>
      </div>
    </section>
    <div className="dash-label">Your toolkit</div>
    <div className="tool-grid">{tools.map(([id, label, desc, Icon, tone]) => <button key={id} className={`tool-card tone-${tone}`} onClick={() => onNavigate(id)}><span className="tool-ic"><Icon size={22} /></span><strong>{label}</strong><span>{desc}</span><ArrowRight size={16} className="tool-go" /></button>)}</div>
    <div className="dash-row">
      <section className="panel builder-card">
        <div className="tip-top"><span className="tile-ic tone-violet"><Wand2 size={16} /></span><strong>Problem statement builder</strong></div>
        <p className="builder-intro">Not sure how to word your idea? Fill these three lines and we will phrase it for you.</p>
        <label>What do you want to do?<input value={b.task} onChange={e => setB({ ...b, task: e.target.value })} placeholder="detect road accidents automatically" /></label>
        <label>With what data or in which area?<input value={b.data} onChange={e => setB({ ...b, data: e.target.value })} placeholder="CCTV video" /></label>
        <label>What makes it hard? <em>(optional)</em><input value={b.hard} onChange={e => setB({ ...b, hard: e.target.value })} placeholder="the footage is low quality or taken at night" /></label>
        <div className={`builder-out ${built ? 'on' : ''}`}>{built || 'Your problem statement will appear here.'}</div>
        <div className="builder-actions"><button className="secondary-btn" disabled={!built} onClick={copy}><Copy size={15} /> Copy</button><button className="primary-btn" disabled={!built} onClick={() => onStart(built)}>Explore this idea <ArrowRight size={15} /></button></div>
      </section>
      <div className="dash-side">
        <section className="panel tip-card"><div className="tip-top"><span className="tile-ic tone-amber"><BookOpen size={16} /></span><strong>Research tip</strong><button className="icon-button" onClick={() => setTip((tip + 1) % tips.length)} aria-label="Next tip"><RefreshCw size={15} /></button></div><p>{tips[tip]}</p><small>Tip {tip + 1} of {tips.length}</small></section>
        <section className="panel mentor-teaser"><span className="tile-ic tone-violet">{next ? <CalendarDays size={16} /> : <Users size={16} />}</span>
          {next ? <><strong>Your next session</strong><p>{next.mentor} on {new Date(next.date + 'T00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}, {next.slot}.</p></> : <><strong>Stuck? Ask a human.</strong><p>Book a verified mentor to review your gap, plan or draft.</p></>}
          <button className="secondary-btn" onClick={() => onNavigate('mentors')}>{next ? 'View sessions' : 'Meet mentors'} <ArrowRight size={15} /></button></section>
      </div>
    </div>
  </>;
}
