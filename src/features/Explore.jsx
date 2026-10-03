import React, { useState } from 'react';
import { AlertTriangle, Brain, CircleHelp, Database, FlaskConical, Globe2, Target, Trophy, BookOpen, Download, ExternalLink, Search, Sparkles } from 'lucide-react';
import { SectionLabel, PageHero, Progress, StatStrip } from '../components/ui';
import { api } from '../api/client';


const GUIDE = { what: 'Turns a rough idea into a clear research brief. Describe your problem in plain words and Explore tells you the domain, objectives, research questions, datasets and methods, and lists the closest published papers.', steps: [["Describe your problem", "Write what you want to research in a few sentences."], ["We read and classify it", "The AI finds your research domain and the key concepts."], ["We find related papers", "Published work is ranked by how close it is to your idea."], ["You get a research brief", "Objectives, questions, datasets, methodology and challenges, ready to refine."]] };

const BLOCK = { 'Research domain': [Globe2, 'indigo'], 'Problem understanding': [Brain, 'violet'], 'Research objectives': [Target, 'teal'], 'Research questions': [CircleHelp, 'amber'], 'Suggested datasets': [Database, 'sky'], 'Suggested methodology': [FlaskConical, 'rose'], 'Challenges': [AlertTriangle, 'amber'], 'Expected contributions': [Trophy, 'green'] };
const Tile = ({ t, children }) => { const [I, tone] = BLOCK[t]; return <div className={`panel analysis-block tile tone-${tone}`}><h4><i className="tile-ic"><I size={15} /></i>{t}</h4>{children}</div>; };

const THINK = ['Reading your problem statement', 'Identifying the research domain', 'Matching related papers', 'Drafting the analysis'];

export function Explore({ initialPs = '' }) {
  const [ps, setPs] = useState(initialPs); const [stage, setStage] = useState(-1); const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('All'); const [year, setYear] = useState('All');
  const [error, setError] = useState('');
  const run = async () => {
    if (ps.trim().length < 15) return;
    setResult(null); setError(''); setStage(0);
    const t = window.setInterval(() => setStage(s => Math.min(s + 1, THINK.length - 1)), 700);
    try { setResult(await api.explore.analyze(ps)); } catch (e) { setError(e.message); } finally { window.clearInterval(t); setStage(-1); }
  };
  const papers = result ? result.papers : [];
  const visible = papers.filter(p => (filter === 'All' || p.type === filter) && (year === 'All' || String(p.year) === year));
  const thinking = stage >= 0;
  return <>
    <PageHero guide={GUIDE} icon={Search} tone="indigo" chips={['Domain analysis', 'Research questions', 'Related papers']} title="Explore" description="Describe your research problem. The AI analyses it and finds the closest published papers." action={result && <button className="secondary-btn"><Download size={15} /> Export sources</button>} />
    <section className="panel ps-input">
      <label htmlFor="ps">Your problem statement</label>
      <textarea id="ps" rows={4} value={ps} onChange={e => setPs(e.target.value)} placeholder="Describe what you want to research, the data you have, and what you hope to achieve. Example: How can deep learning detect road accidents reliably from real-world CCTV footage?" />
      <div className="ps-foot"><span>{ps.trim().length < 15 ? 'Write at least one full sentence.' : `${ps.trim().split(/\s+/).length} words`}</span><button className="primary-btn" disabled={thinking || ps.trim().length < 15} onClick={run}><Sparkles size={16} /> {result ? 'Analyse again' : 'Analyse problem'}</button></div>
    </section>
    {thinking && <Progress steps={THINK} current={stage} />}{error && <div className="panel error-box">Could not analyse: {error}</div>}
    {!thinking && !result && !error && <div className="panel empty-state"><Search size={26} /><strong>Nothing analysed yet</strong><span>Enter your problem statement above. You will get a structured analysis here and related papers on the right.</span></div>}
    {result && !thinking && <StatStrip items={[['Related papers', papers.length], ['Closest match', Math.max(...papers.map(p => p.similarity)) + '%'], ['Avg. citations', Math.round(papers.reduce((a, p) => a + p.citations, 0) / papers.length)], ['Years covered', Math.min(...papers.map(p => p.year)) + '–' + Math.max(...papers.map(p => p.year))]]} />}
    {result && !thinking && <div className="explore-split">
      <section className="analysis-col">
        <div className="analysis-head"><span className="ai-spark"><Sparkles size={15} /></span><div><strong>Your research brief</strong><small>Built from your statement and related papers</small></div></div>
        <Tile t="Research domain"><div className="concepts">{result.domain.map(d => <span key={d}>{d}</span>)}</div></Tile>
        <Tile t="Problem understanding"><p>{result.understanding}</p></Tile>
        <Tile t="Research objectives"><ul>{result.objectives.map(o => <li key={o}>{o}</li>)}</ul></Tile>
        <Tile t="Research questions"><ul>{result.questions.map(o => <li key={o}>{o}</li>)}</ul></Tile>
        <Tile t="Suggested datasets"><div className="concepts">{result.datasets.map(d => <span key={d}>{d}</span>)}</div></Tile>
        <Tile t="Suggested methodology"><p>{result.methodology}</p></Tile>
        <Tile t="Challenges"><ul>{result.challenges.map(o => <li key={o}>{o}</li>)}</ul></Tile>
        <Tile t="Expected contributions"><ul>{result.contributions.map(o => <li key={o}>{o}</li>)}</ul></Tile>
      </section>
      <section className="explore-right papers-col"><div className="right-head"><div><SectionLabel>RELATED PAPERS</SectionLabel><h3>Sorted by similarity</h3></div><div className="filters"><div className="filter-chips">{['All', 'Conference', 'Journal'].map(f => <button className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div><select value={year} onChange={e => setYear(e.target.value)}><option>All</option><option>2025</option><option>2024</option><option>2023</option></select></div></div>
        <div className="paper-list">{visible.map(p => <article className="paper-card" key={p.title}><div className="paper-icon"><BookOpen size={17} /></div><div className="paper-main"><div className="paper-title-row"><h3>{p.title}</h3><span className="similarity-badge">{p.similarity}%</span></div><p>{p.publisher} · {p.year} · Published {p.date}</p><div className="paper-meta"><span className={`type-badge ${p.type.toLowerCase()}`}>{p.type} paper</span><span className="cite-count">{p.citations} citations</span><a href="#" onClick={e => e.preventDefault()}><ExternalLink size={13} /> {p.source}</a></div></div></article>)}{!visible.length && <div className="panel empty-state"><span>No papers match these filters.</span></div>}</div>
      </section>
    </div>}
  </>;
}
