import React, { useState } from 'react';
import { ArrowRight, Check, CheckCircle2, ExternalLink, Lightbulb, Quote, UploadCloud, X } from 'lucide-react';
import { SectionLabel, PageHero, Progress, StatStrip } from '../components/ui';
import { api } from '../api/client';
import { clearPersist } from '../lib/persist';

const GUIDE = { what: 'Finds what a research paper left unsolved. Upload a paper and get a list of gaps. Each gap is explained in plain words and backed by evidence: exact quotes from your paper and related papers that support it. Select the gaps you want to solve and they carry over to the Experiment plan.', steps: [['Upload a paper', 'Add a PDF or DOCX of the paper you want to build on.'], ['The AI reads it', 'It finds limitations and open problems, and quotes the exact lines.'], ['We check other papers', 'Related papers are searched and kept only if they truly support the gap.'], ['You select what to solve', 'Chosen gaps go straight into your Experiment plan.']] };
const STEPS = ['Reading the paper', 'Finding limitations', 'Checking related papers', 'Ranking the gaps'];
const tone = (n) => (n >= 3 ? 'green' : n >= 1 ? 'amber' : 'grey');

export function Gaps({ selectedGaps, setSelectedGaps, result, setResult, file, setFile, onNavigate }) {
  const [drawer, setDrawer] = useState(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [stage, setStage] = useState(0);
  const list = result ? result.gaps : [];
  const toggle = (g) => setSelectedGaps(prev => prev.some(x => x.id === g.id) ? prev.filter(x => x.id !== g.id) : [...prev, g]);
  const find = async () => {
    setBusy(true); setError(''); setResult(null); setSelectedGaps([]); clearPersist('experiment'); setStage(0);
    const t = window.setInterval(() => setStage(s => Math.min(s + 1, STEPS.length - 1)), 7000);
    try { setResult(await api.gaps.detect(file)); } catch (e) { setError(e.message); } finally { window.clearInterval(t); setBusy(false); }
  };
  const pick = (e) => { const f = e.target.files && e.target.files[0]; if (f) { setFile(f); setResult(null); setSelectedGaps([]); setError(''); } };
  return <>
    <PageHero guide={GUIDE} icon={Lightbulb} tone="amber" chips={['Upload a paper', 'Evidence for every gap', 'Select what to solve']} title="Research gaps" description="Upload a paper. The AI finds what it left open, explains each gap and shows the proof." />
    <section className="upload-panel panel"><label className="upload-zone"><input type="file" accept=".pdf,.docx" hidden onChange={pick} /><UploadCloud size={24} /><strong>{file ? 'Paper ready for analysis' : 'Upload PDF / DOCX'}</strong><span>{file ? file.name : 'Click to browse your files (max 15 MB)'}</span></label><div className="upload-actions"><span>{file ? <><CheckCircle2 size={15} /> 1 paper selected</> : 'Upload a paper to begin.'}</span><button className="primary-btn" disabled={!file || busy} onClick={find}>{busy ? 'Analysing paper…' : 'Find research gaps'} <ArrowRight size={16} /></button></div></section>
    {busy && <Progress steps={STEPS} current={stage} />}
    {error && <div className="panel error-box">Could not analyse the paper: {error}</div>}
    {!result && !busy && !error && <div className="panel empty-state"><Lightbulb size={26} /><strong>No gaps yet</strong><span>Upload a paper and choose Find research gaps. You can then select any number of gaps and build an experiment plan from them.</span></div>}
    {result && !busy && <>
      <section className="panel paper-summary"><SectionLabel>PAPER ANALYSED</SectionLabel><h3>{result.paper.title}</h3><p>{result.paper.summary}</p></section>
      {list.length === 0 ? <div className="panel empty-state"><span>No clear gaps could be found in this paper. Try a paper with a discussion or limitations section.</span></div> : <>
        <StatStrip items={[['Gaps found', list.length], ['High impact', list.filter(g => g.impact === 'High').length], ['Selected', selectedGaps.length]]} />
        <div className="gap-list">{list.map(g => { const on = selectedGaps.some(x => x.id === g.id); const n = g.support.length; return <article className={`gap-card ${on ? 'selected' : ''}`} key={g.id}>
          <div className="gap-top"><div><span className={`evidence ${tone(n)}`}>{n ? `Supported by ${n} paper${n === 1 ? '' : 's'}` : 'No supporting papers found'}</span>{g.quotes.length > 0 && <span className="evidence green quoted"><Quote size={11} /> Quoted from your paper</span>}<h3>{g.title}</h3></div>
            <label className={`gap-select ${on ? 'chosen' : ''}`}><input type="checkbox" hidden checked={on} onChange={() => toggle(g)} />{on ? <><Check size={14} /> Selected</> : 'Select gap'}</label></div>
          <p className="gap-explain">{g.explanation}</p>
          <dl className="gap-fields"><div><dt>What the paper does</dt><dd>{g.done}</dd></div><div><dt>Limitation</dt><dd>{g.limit}</dd></div><div><dt>Improvement opportunity</dt><dd>{g.improve}</dd></div><div><dt>Impact</dt><dd><span className={`impact ${g.impact.toLowerCase()}`}>{g.impact}</span> <span className="impact-why">{g.impact_reason}</span></dd></div></dl>
          <div className="gap-source"><span className="muted">{g.quotes.length} quote{g.quotes.length === 1 ? '' : 's'} · {n} related paper{n === 1 ? '' : 's'}</span><button className="secondary-btn" onClick={() => setDrawer(g)}>View evidence</button></div></article>; })}</div>
        <div className="sticky-action"><div><strong>{selectedGaps.length ? `${selectedGaps.length} gap${selectedGaps.length === 1 ? '' : 's'} selected` : 'Select one or more gaps'}</strong><span>Selected gaps become your experiment plan.</span></div><div>{!!selectedGaps.length && <button className="text-btn" onClick={() => setSelectedGaps([])}>Clear</button>}<button className="primary-btn" disabled={!selectedGaps.length} onClick={() => onNavigate('experiment')}>Create experiment plan <ArrowRight size={15} /></button></div></div></>}</>}
    {drawer && <div className="drawer-overlay" onClick={() => setDrawer(null)}><aside className="source-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><SectionLabel>EVIDENCE</SectionLabel><h3>{drawer.title}</h3></div><button className="icon-button" onClick={() => setDrawer(null)}><X size={18} /></button></div>
      <h4 className="drawer-h">In your paper</h4>{drawer.quotes.length ? drawer.quotes.map((q, i) => <blockquote key={i}>“{q}”<small>Exact sentence from the uploaded paper</small></blockquote>) : <p className="muted">No exact sentence was found for this gap. It was inferred from the paper as a whole.</p>}
      <h4 className="drawer-h">In related papers</h4>{drawer.support.length ? drawer.support.map(s => <div className="support-item" key={s.url + s.title}><a href={s.url} target="_blank" rel="noreferrer"><strong>{s.title}</strong> <ExternalLink size={12} /></a><small>{s.venue || s.publisher} · {s.year} · {s.citations.toLocaleString()} citations</small><p>{s.reason}</p></div>) : <p className="muted">No related paper clearly confirmed this gap.</p>}
      <button className="primary-btn full" onClick={() => setDrawer(null)}>Done reviewing evidence</button></aside></div>}
  </>;
}
