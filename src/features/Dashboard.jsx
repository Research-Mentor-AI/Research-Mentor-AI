import React, { useState } from 'react';
import { ArrowRight, BookOpen, Check, FileText, FlaskConical, Lightbulb, RefreshCw, Search, Sparkles, Target, Users } from 'lucide-react';

const starters = [
  'How can deep learning detect road accidents from CCTV footage?',
  'Can LLMs detect fake news in low-resource languages?',
  'How does AI tutoring change student learning outcomes?',
  'Can federated learning protect patient data across hospitals?'
];
const tools = [
  ['explore', 'Explore', 'Describe your idea and meet the papers closest to it.', Search, 'indigo'],
  ['novelty', 'Novelty check', 'Find out how new your idea really is.', Target, 'violet'],
  ['gaps', 'Research gaps', 'Upload a paper and see what it left open.', Lightbulb, 'amber'],
  ['experiment', 'Experiment plan', 'Turn chosen gaps into datasets, baselines and metrics.', FlaskConical, 'teal'],
  ['writer', 'Draft paper', 'Get every section of your paper drafted.', FileText, 'sky']
];
const tips = [
  'Read the limitations and future-work sections first. That is where papers admit their gaps.',
  'A good problem statement names the task, the data and what is currently missing.',
  'Always run a simple baseline before your own model. Reviewers will ask for it.',
  'Report more than accuracy. Precision, recall and F1 show where a model fails.',
  'Write the abstract last. It is easy once the rest of the paper exists.'
];
const checklist = ['Write a clear problem statement', 'Read 10 or more related papers', 'Pick one research gap', 'Choose dataset and baseline', 'Run your first experiment', 'Draft the paper'];

export function Dashboard({ user, onNavigate, onStart }) {
  const [text, setText] = useState(''); const [tip, setTip] = useState(0); const [done, setDone] = useState([]);
  const toggle = (c) => setDone(d => d.includes(c) ? d.filter(x => x !== c) : [...d, c]);
  const pct = Math.round(done.length / checklist.length * 100);
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
    <div className="tool-grid">{tools.map(([id, label, desc, Icon, tone]) => <button key={id} className={`tool-card tone-${tone}`} onClick={() => onNavigate(id)}><span className="tool-ic"><Icon size={20} /></span><strong>{label}</strong><span>{desc}</span><ArrowRight size={16} className="tool-go" /></button>)}</div>
    <div className="dash-row">
      <section className="panel tip-card"><div className="tip-top"><span className="tile-ic tone-amber"><BookOpen size={15} /></span><strong>Research tip</strong><button className="icon-button" onClick={() => setTip((tip + 1) % tips.length)} aria-label="Next tip"><RefreshCw size={15} /></button></div><p>{tips[tip]}</p><small>Tip {tip + 1} of {tips.length}</small></section>
      <section className="panel checklist-card"><div className="check-top"><div><strong>Your research checklist</strong><small>{done.length} of {checklist.length} done</small></div><div className="ring" style={{ '--p': pct }}><b>{pct}%</b></div></div>
        {checklist.map(c => <label key={c} className={`todo ${done.includes(c) ? 'on' : ''}`}><input type="checkbox" checked={done.includes(c)} onChange={() => toggle(c)} /><span className="custom-check">{done.includes(c) && <Check size={12} />}</span>{c}</label>)}</section>
      <section className="panel mentor-teaser"><span className="tile-ic tone-violet"><Users size={15} /></span><strong>Stuck? Ask a human.</strong><p>Book a verified mentor to review your gap, plan or draft.</p><button className="secondary-btn" onClick={() => onNavigate('mentors')}>Meet mentors <ArrowRight size={15} /></button></section>
    </div>
  </>;
}
