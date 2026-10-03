import React, { useState } from 'react';
import { X, ArrowRight, Check, CheckCircle2, ExternalLink, Lightbulb, UploadCloud } from 'lucide-react';
import { SectionLabel, PageHero, Progress, StatStrip } from '../components/ui';
import { api } from '../api/client';

const GUIDE = { what: 'Finds what a research paper left unsolved. Upload a paper and get a list of gaps, each with its limitation and how you can improve on it. Select the gaps you want to solve and they carry over to the Experiment plan.', steps: [["Upload a paper", "Add a PDF or DOCX of the paper you want to build on."], ["We read its limitations", "The paper is scanned for limitations and future-work notes."], ["You see the gaps", "Each gap shows what the paper does, its limitation, the improvement and impact."], ["You select what to solve", "Chosen gaps go straight into your Experiment plan."]] };

export function Gaps({ selectedGaps, setSelectedGaps, list, setList, file, setFile, onNavigate, notify }) {
  const [drawer, setDrawer] = useState(null); const [busy, setBusy] = useState(false);
  const toggleGap = (gap) => setSelectedGaps(prev => prev.some(g => g.title === gap.title) ? prev.filter(g => g.title !== gap.title) : [...prev, gap]);
  const [error, setError] = useState(''); const [stage, setStage] = useState(0);
  const STEPS = ['Reading the paper', 'Finding limitations', 'Comparing with related work', 'Ranking the gaps'];
  const find = async () => { setBusy(true); setError(''); setList([]); setSelectedGaps([]); setStage(0); const t = window.setInterval(() => setStage(s => Math.min(s + 1, 3)), 600); try { setList(await api.gaps.detect(file)); } catch (e) { setError(e.message); } finally { window.clearInterval(t); setBusy(false); } };
  const pick = (e) => { const f = e.target.files && e.target.files[0]; if (f) { setFile(f); setList([]); setSelectedGaps([]); } };
  const found = list.length > 0;
  return <><PageHero guide={GUIDE} icon={Lightbulb} tone="amber" chips={['Upload a paper', 'Spot the gaps', 'Select what to solve']} title="Research gaps" description="Upload a research paper. The AI finds what it left open and how you can improve on it." />
    <section className="upload-panel panel"><label className="upload-zone"><input type="file" accept=".pdf,.docx" hidden onChange={pick} /><UploadCloud size={24} /><strong>{file ? 'Paper ready for analysis' : 'Upload PDF / DOCX'}</strong><span>{file ? file.name : 'Click to browse your files'}</span></label><div className="upload-actions"><span>{file ? <><CheckCircle2 size={15} /> 1 paper selected</> : 'Upload a paper to begin.'}</span><button className="primary-btn" disabled={!file || busy} onClick={find}>{busy ? 'Analysing paper…' : 'Find research gaps'} <ArrowRight size={16} /></button></div></section>
    {busy && <Progress steps={STEPS} current={stage} />}{error && <div className="panel error-box">Could not analyse the paper: {error}</div>}
    {!found && !busy && !error && <div className="panel empty-state"><Lightbulb size={26} /><strong>No gaps yet</strong><span>Upload a paper and choose Find research gaps. You can then select any number of gaps and build an experiment plan from them.</span></div>}
    {found && <>
      <StatStrip items={[['Gaps found', list.length], ['High impact', list.filter(g => g.impact === 'High').length], ['Selected', selectedGaps.length]]} />
      <div className="section-heading"><div><SectionLabel>RESULT</SectionLabel><h3>{list.length} research gaps found in this paper</h3></div><span className="result-count">{selectedGaps.length} selected</span></div>
      <div className="gap-list">{list.map(g => { const on = selectedGaps.some(x => x.title === g.title); return <article className={`gap-card ${on ? 'selected' : ''}`} key={g.title}>
        <div className="gap-top"><div><span className={`evidence ${g.tone}`}>{g.evidence}</span><h3>{g.title}</h3></div><label className={`gap-select ${on ? 'chosen' : ''}`}><input type="checkbox" hidden checked={on} onChange={() => toggleGap(g)} />{on ? <><Check size={14} /> Selected</> : 'Select gap'}</label></div>
        <dl className="gap-fields"><div><dt>What the paper does</dt><dd>{g.done}</dd></div><div><dt>Limitation</dt><dd>{g.limit}</dd></div><div><dt>Improvement opportunity</dt><dd>{g.improve}</dd></div><div><dt>Impact</dt><dd><span className={`impact ${g.impact.toLowerCase()}`}>{g.impact}</span></dd></div></dl>
        <div className="gap-source"><a href="#" onClick={e => e.preventDefault()}><ExternalLink size={13} /> {g.source}</a><button className="secondary-btn" onClick={() => setDrawer(g)}>View sources</button></div></article>; })}</div>
      <div className="sticky-action"><div><strong>{selectedGaps.length ? `${selectedGaps.length} gap${selectedGaps.length === 1 ? '' : 's'} selected` : 'Select one or more gaps'}</strong><span>Selected gaps become your experiment plan.</span></div><div>{!!selectedGaps.length && <button className="text-btn" onClick={() => setSelectedGaps([])}>Clear</button>}<button className="primary-btn" disabled={!selectedGaps.length} onClick={() => onNavigate('experiment')}>Create experiment plan <ArrowRight size={15} /></button></div></div></>}
    {drawer && <div className="drawer-overlay" onClick={() => setDrawer(null)}><aside className="source-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><SectionLabel>SOURCE EVIDENCE</SectionLabel><h3>Exact supporting excerpts</h3></div><button className="icon-button" onClick={() => setDrawer(null)}><X size={18} /></button></div><div className="drawer-gap"><span className={`evidence ${drawer.tone}`}>{drawer.evidence}</span><h4>{drawer.title}</h4><p>{drawer.source}</p></div>{drawer.quotes.map((q, i) => <blockquote key={i}>“{q}”<small>Source excerpt · {drawer.source}</small></blockquote>)}<button className="primary-btn full" onClick={() => setDrawer(null)}>Done reviewing sources</button></aside></div>}
  </>;
}
