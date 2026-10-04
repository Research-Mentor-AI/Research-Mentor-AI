import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Lightbulb, Target, TrendingUp, BookOpen, Compass } from 'lucide-react';
import { SectionLabel, PageHero, Progress } from '../components/ui';
import { api } from '../api/client';
import { usePersist } from '../lib/persist';

const GUIDE = { what: 'Tells you how new your idea is before you spend months on it. Your idea is compared with real published papers, and you get a score out of 100, what has already been done, what is still open, and where you could publish.', steps: [['Enter your idea', 'Paste the problem you want to test.'], ['We compare it with real papers', 'The AI reads the closest published papers.'], ['You see the score and overlap', 'Low, medium or high novelty, with the papers behind it.'], ['You see how to stand out', 'Open angles to own, and journals or conferences to aim for.']] };
const STEPS = ['Understanding your idea', 'Searching published work', 'Comparing and scoring'];

function Gauge({ score }) {
  const a = Math.PI * (1 - score / 100), x = 100 + 80 * Math.cos(a), y = 100 - 80 * Math.sin(a);
  return <svg className="gauge" viewBox="0 0 200 118" role="img" aria-label={`Novelty score ${score} out of 100`}><path d="M20 100 A80 80 0 0 1 180 100" className="g-track" /><path d={`M20 100 A80 80 0 0 1 ${x} ${y}`} className="g-fill" /><text x="100" y="92" textAnchor="middle" className="g-num">{score}</text><text x="100" y="112" textAnchor="middle" className="g-sub">out of 100</text></svg>;
}
const Block = ({ icon: I, tone, title, items }) => <section className={`panel analysis-block tile tone-${tone}`}><h4><i className="tile-ic"><I size={15} /></i>{title}</h4><ul className="tick-list">{items.map(n => <li key={n}><CheckCircle2 size={15} />{n}</li>)}</ul></section>;

export function Novelty() {
  const [ps, setPs] = usePersist('novelty:ps', ''); const [data, setData] = usePersist('novelty:data', null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const check = async () => { setBusy(true); setError(''); setData(null); try { setData(await api.novelty.check(ps)); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const tone = !data ? '' : data.score < 40 ? 'low' : data.score <= 80 ? 'medium' : 'high';
  return <>
    <PageHero guide={GUIDE} icon={Target} tone="violet" chips={['Novelty score', 'Already done vs still open', 'Where to publish']} title="Novelty check" description="See how new your research idea is compared with real published work." />
    <section className="novelty-input panel"><label>Your idea or problem statement</label><div><textarea value={ps} onChange={e => setPs(e.target.value)} placeholder="Describe the idea you want to test, for example: Detecting road accidents in low-resolution CCTV video using video transformers." /><button className="primary-btn" disabled={busy || ps.trim().length < 15} onClick={check}>{data ? 'Check again' : 'Check novelty'} <Target size={16} /></button></div></section>
    {busy && <Progress steps={STEPS} current={1} />}
    {error && <div className="panel error-box">Could not run the check: {error}</div>}
    {!busy && !data && !error && <div className="panel empty-state"><Target size={26} /><strong>Run the check to see your results</strong><span>You will get a novelty score, what has already been done, what is still open, the closest papers and where to publish.</span></div>}
    {data && !busy && <>
      <div className={`score-card ${tone}`}><Gauge score={data.score} /><div className="score-verdict"><span>Assessment</span><h3>{data.verdict}</h3><p>{data.summary}</p></div></div>
      <div className="novelty-cols">
        {data.already_done.length > 0 && <Block icon={BookOpen} tone="amber" title="Already explored by others" items={data.already_done} />}
        {data.open_angles.length > 0 && <Block icon={Compass} tone="green" title="Still open: your opportunity" items={data.open_angles} />}
      </div>
      {data.stand_out.length > 0 && <Block icon={TrendingUp} tone="violet" title="How to make your idea stronger" items={data.stand_out} />}
      <section className="novelty-papers"><div className="section-heading"><div><SectionLabel>CLOSEST PAPERS</SectionLabel><h3>Existing work that overlaps with your idea</h3></div><span className="result-count">{data.papers.length} papers</span></div>
        <div className="table-wrap"><table><thead><tr><th>Paper</th><th>Venue</th><th>Year</th><th>Overlap</th><th>How it overlaps</th></tr></thead><tbody>{data.papers.map(p => <tr key={p.url + p.title}><td><a href={p.url} target="_blank" rel="noreferrer"><strong>{p.title}</strong> <ExternalLink size={12} /></a></td><td>{p.venue || p.publisher}<br /><small className="muted">{p.type}</small></td><td>{p.year}</td><td><div className="table-sim"><span><i style={{ width: `${p.overlap}%` }} /></span><b>{p.overlap}%</b></div></td><td className="how-cell">{p.how}</td></tr>)}</tbody></table></div>
        <p className="fine-print"><Lightbulb size={14} /> The score is based on the papers found here. It is guidance, not proof that an idea is or is not already published.</p></section>
      {data.venues.length > 0 && <section className="panel analysis-block"><h4>Where you could publish</h4><p className="muted">Venues where the closest papers appeared.</p><div className="concepts venue-chips">{data.venues.map(v => <span key={v.name}>{v.name} <em>{v.type}{v.count > 1 ? ` · ${v.count} papers` : ''}</em></span>)}</div></section>}
    </>}
  </>;
}
