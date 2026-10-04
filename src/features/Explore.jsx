import React, { useState } from 'react';
import { AlertTriangle, BookOpen, Brain, CircleHelp, Database, Download, ExternalLink, FlaskConical, Globe2, Loader2, Search, Sparkles, Target, Trophy } from 'lucide-react';
import { SectionLabel, PageHero, Progress, StatStrip } from '../components/ui';
import { api } from '../api/client';
import { csvCell, download, fmtDate } from '../lib/download';

const GUIDE = { what: 'Turns a rough idea into a clear research brief. Describe your problem in plain words and Explore tells you the domain, objectives, research questions, datasets and methods, and lists the closest real published papers.', steps: [['Describe your problem', 'Write what you want to research in a few sentences.'], ['The AI analyses it', 'It finds your research domain, objectives and questions.'], ['We find real papers', 'Published papers are retrieved and scored for similarity.'], ['You get a research brief', 'Review the analysis, then load more papers if you need them.']] };
const BLOCK = { 'Research domain': [Globe2, 'indigo'], 'Problem understanding': [Brain, 'violet'], 'Research objectives': [Target, 'teal'], 'Research questions': [CircleHelp, 'amber'], 'Suggested datasets': [Database, 'sky'], 'Suggested methodology': [FlaskConical, 'rose'], 'Challenges': [AlertTriangle, 'amber'], 'Expected contributions': [Trophy, 'green'] };
const Tile = ({ t, children }) => { const [I, tone] = BLOCK[t]; return <div className={`panel analysis-block tile tone-${tone}`}><h4><i className="tile-ic"><I size={15} /></i>{t}</h4>{children}</div>; };
const List = ({ items }) => items.length ? <ul>{items.map(o => <li key={o}>{o}</li>)}</ul> : <p className="muted">Nothing suggested.</p>;
const Chips = ({ items }) => items.length ? <div className="concepts">{items.map(d => <span key={d}>{d}</span>)}</div> : <p className="muted">Nothing suggested.</p>;
const STEPS = ['Reading your problem statement', 'Identifying the research domain', 'Searching published papers', 'Scoring papers for similarity'];

export function Explore({ initialPs = '' }) {
  const [ps, setPs] = useState(initialPs); const [stage, setStage] = useState(-1); const [result, setResult] = useState(null); const [error, setError] = useState('');
  const [papers, setPapers] = useState([]); const [loadingMore, setLoadingMore] = useState(false); const [moreError, setMoreError] = useState('');
  const [filter, setFilter] = useState('All'); const [year, setYear] = useState('All');
  const thinking = stage >= 0;

  const run = async () => {
    if (ps.trim().length < 15 || thinking) return;
    setResult(null); setPapers([]); setError(''); setMoreError(''); setFilter('All'); setYear('All'); setStage(0);
    const t = window.setInterval(() => setStage(s => Math.min(s + 1, STEPS.length - 1)), 4000);
    try { const r = await api.explore.analyze(ps); setResult(r); setPapers(r.papers); } catch (e) { setError(e.message); } finally { window.clearInterval(t); setStage(-1); }
  };
  const loadMore = async () => {
    setLoadingMore(true); setMoreError('');
    try { const r = await api.explore.more(result.search_id, papers.length); setPapers(p => [...p, ...r.papers]); setResult(x => ({ ...x, has_more: r.has_more })); } catch (e) { setMoreError(e.message); } finally { setLoadingMore(false); }
  };
  const exportCsv = () => download('related-papers.csv', ['Title,Publisher,Venue,Year,Type,Citations,Similarity,Link', ...papers.map(p => [p.title, p.publisher, p.venue, p.year, p.type, p.citations, p.similarity, p.url].map(csvCell).join(','))].join('\n'), 'text/csv');
  const years = [...new Set(papers.map(p => p.year))].sort((a, b) => b - a);
  const types = ['All', ...new Set(papers.map(p => p.type))];
  const visible = papers.filter(p => (filter === 'All' || p.type === filter) && (year === 'All' || String(p.year) === year));

  return <>
    <PageHero guide={GUIDE} icon={Search} tone="indigo" chips={['Domain analysis', 'Research questions', 'Related papers']} title="Explore" description="Describe your research problem. The AI analyses it and finds the closest published papers." action={papers.length > 0 && <button className="secondary-btn" onClick={exportCsv}><Download size={15} /> Export papers</button>} />
    <section className="panel ps-input">
      <label htmlFor="ps">Your problem statement</label>
      <textarea id="ps" rows={4} value={ps} onChange={e => setPs(e.target.value)} placeholder="Describe what you want to research, the data you have, and what you hope to achieve. Example: How can deep learning detect road accidents reliably from real-world CCTV footage?" />
      <div className="ps-foot"><span>{ps.trim().length < 15 ? 'Write at least one full sentence.' : `${ps.trim().split(/\s+/).length} words`}</span><button className="primary-btn" disabled={thinking || ps.trim().length < 15} onClick={run}><Sparkles size={16} /> {result ? 'Analyse again' : 'Analyse problem'}</button></div>
    </section>
    {thinking && <Progress steps={STEPS} current={stage} />}
    {error && <div className="panel error-box">Could not analyse: {error}</div>}
    {!thinking && !result && !error && <div className="panel empty-state"><Search size={26} /><strong>Nothing analysed yet</strong><span>Enter your problem statement above. You will get a structured analysis here and related papers on the right.</span></div>}
    {result && !thinking && papers.length > 0 && <StatStrip items={[['Papers shown', `${papers.length} of ${result.total}`], ['Closest match', Math.max(...papers.map(p => p.similarity)) + '%'], ['Avg. citations', Math.round(papers.reduce((a, p) => a + p.citations, 0) / papers.length)], ['Years covered', `${Math.min(...papers.map(p => p.year))}–${Math.max(...papers.map(p => p.year))}`]]} />}
    {result && !thinking && <div className="explore-split">
      <section className="analysis-col">
        <div className="analysis-head"><span className="ai-spark"><Sparkles size={15} /></span><div><strong>Your research brief</strong><small>Built from your statement and related papers</small></div></div>
        <Tile t="Research domain"><Chips items={result.domain} /></Tile>
        <Tile t="Problem understanding"><p>{result.understanding}</p></Tile>
        <Tile t="Research objectives"><List items={result.objectives} /></Tile>
        <Tile t="Research questions"><List items={result.questions} /></Tile>
        <Tile t="Suggested datasets"><Chips items={result.datasets} /></Tile>
        <Tile t="Suggested methodology"><p>{result.methodology}</p></Tile>
        <Tile t="Challenges"><List items={result.challenges} /></Tile>
        <Tile t="Expected contributions"><List items={result.contributions} /></Tile>
      </section>
      <section className="explore-right papers-col"><div className="right-head"><div><SectionLabel>RELATED PAPERS</SectionLabel><h3>Sorted by similarity</h3></div>
        {papers.length > 0 && <div className="filters"><div className="filter-chips">{types.map(f => <button className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)} key={f}>{f}</button>)}</div><select value={year} onChange={e => setYear(e.target.value)}><option>All</option>{years.map(y => <option key={y}>{y}</option>)}</select></div>}</div>
        <div className="paper-list">{visible.map(p => <article className="paper-card" key={p.url + p.title}><div className="paper-icon"><BookOpen size={17} /></div><div className="paper-main"><div className="paper-title-row"><h3><a href={p.url} target="_blank" rel="noreferrer">{p.title}</a></h3><span className="similarity-badge">{p.similarity}%</span></div><p>{p.publisher}{p.venue && p.venue !== p.publisher ? ` · ${p.venue}` : ''} · {p.year} · {fmtDate(p.date)}</p>{p.reason && <p className="paper-reason">{p.reason}</p>}<div className="paper-meta"><span className={`type-badge ${p.type.toLowerCase()}`}>{p.type}</span><span className="cite-count">{p.citations.toLocaleString()} citations</span><a href={p.url} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Open paper</a></div></div></article>)}
          {!visible.length && <div className="panel empty-state"><span>{papers.length ? 'No papers match these filters.' : 'No related papers were found. Try describing your problem with different keywords.'}</span></div>}</div>
        {moreError && <div className="panel error-box">{moreError}</div>}
        {papers.length > 0 && (result.has_more ? <button className="secondary-btn load-more" onClick={loadMore} disabled={loadingMore}>{loadingMore ? <><Loader2 size={15} className="spin" /> Loading…</> : 'Load 5 more papers'}</button> : <p className="end-note">That is every paper found for this problem.</p>)}
      </section>
    </div>}
  </>;
}
