import React, { useState } from 'react';
import { AlertCircle, Check, CheckCircle2, ExternalLink, ShieldCheck, Target } from 'lucide-react';
import { SectionLabel, PageHero, Progress } from '../components/ui';
import { api } from '../api/client';

const GUIDE = { what: 'Tells you how new your idea is before you spend months on it. Your problem statement is compared with published papers and scored out of 100.', steps: [["Enter your problem statement", "Paste the idea you want to test."], ["We compare it with published work", "Your idea is matched against the closest papers."], ["You see the score and overlap", "Low, medium or high novelty, plus the papers that overlap."], ["You review readiness", "See your novel contributions and what is missing before you publish."]] };

function Gauge({ score }) {
  const a = Math.PI * (1 - score / 100), x = 100 + 80 * Math.cos(a), y = 100 - 80 * Math.sin(a);
  return <svg className="gauge" viewBox="0 0 200 118" role="img" aria-label={`Novelty score ${score} out of 100`}><path d="M20 100 A80 80 0 0 1 180 100" className="g-track" /><path d={`M20 100 A80 80 0 0 1 ${x} ${y}`} className="g-fill" /><text x="100" y="92" textAnchor="middle" className="g-num">{score}</text><text x="100" y="112" textAnchor="middle" className="g-sub">out of 100</text></svg>;
}

export function Novelty() {
  const [data, setData] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const score = data ? data.score : 0; const papers = data ? data.overlap : [];
  const [ps, setPs] = useState('How can deep learning detect road accidents reliably from real-world CCTV footage?');
  const verdict = score < 40 ? 'Low novelty' : score <= 80 ? 'Medium novelty' : 'High novelty'; const tone = score < 40 ? 'low' : score <= 80 ? 'medium' : 'high';
  const check = async () => { setBusy(true); setError(''); try { setData(await api.novelty.check(ps)); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const checked = !!data;
  return <>
    <PageHero guide={GUIDE} icon={Target} tone="violet" chips={['Novelty score', 'Overlap', 'Publication readiness']} title="Novelty check" description="See how new your research idea is compared with the closest published work." />
    <section className="novelty-input panel"><label>Your problem statement</label><div><textarea value={ps} onChange={e => setPs(e.target.value)} /><button className="primary-btn" disabled={busy || ps.trim().length < 15} onClick={check}>{checked ? <><Check size={16} /> Re-check novelty</> : <>Check novelty <Target size={16} /></>}</button></div></section>
    {busy ? <Progress steps={['Embedding your idea', 'Searching published work', 'Scoring overlap']} current={1} /> : error ? <div className="panel error-box">Could not run the check: {error}</div> : !checked ? <div className="panel empty-state"><Target size={26} /><strong>Run the check to see your results</strong><span>You will get a novelty score, your novel contributions, overlap with existing work and publication readiness.</span></div> : <>
      <div className={`score-card ${tone}`}><Gauge score={score} /><div className="score-verdict"><span>Assessment</span><h3>{verdict}</h3><p>Based on semantic similarity with the closest retrieved papers. Below 40 is low, 40 to 80 is medium, above 80 is high.</p></div></div>
      <div className="novelty-cols">
        <section className="panel analysis-block"><h4>Novel contributions</h4><ul className="tick-list">{data.novel.map(n => <li key={n}><CheckCircle2 size={15} />{n}</li>)}</ul></section>
        <section className="panel analysis-block"><h4>Publication readiness</h4><div className="readiness-bar"><i style={{ width: `${data.readiness.filter(r => r[1]).length / data.readiness.length * 100}%` }} /></div><small className="readiness-note">{data.readiness.filter(r => r[1]).length} of {data.readiness.length} checks complete</small><ul className="tick-list">{data.readiness.map(([t, ok]) => <li key={t} className={ok ? '' : 'pending'}>{ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{t}</li>)}</ul></section>
      </div>
      <section><div className="section-heading"><div><SectionLabel>EXISTING WORK OVERLAP</SectionLabel><h3>Closest papers to your idea</h3></div><span className="result-count">{papers.length} papers</span></div><div className="table-wrap"><table><thead><tr><th>Paper</th><th>Publisher</th><th>Year</th><th>Overlap</th><th>Source</th></tr></thead><tbody>{papers.map(p => <tr key={p.title}><td><strong>{p.title}</strong></td><td>{p.publisher}</td><td>{p.year}</td><td><div className="table-sim"><span><i style={{ width: `${p.similarity}%` }} /></span><b>{p.similarity}%</b></div></td><td><a href="#" onClick={e => e.preventDefault()}><ExternalLink size={12} /> Source</a></td></tr>)}</tbody></table></div><p className="fine-print"><ShieldCheck size={14} /> Overlap is evidence, not proof that an idea is already published.</p></section></>}
  </>;
}
