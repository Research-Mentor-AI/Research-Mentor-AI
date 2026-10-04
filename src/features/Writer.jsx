import React, { useState } from 'react';
import { Copy, Download, FileText, Lightbulb, Plus, ShieldCheck, Sparkles, X } from 'lucide-react';
import { PageHero } from '../components/ui';
import { api } from '../api/client';
import { usePersist } from '../lib/persist';

const GUIDE = { what: 'Drafts your research paper section by section. Tell us what you know, choose the sections you want, and get a first draft you can edit.', steps: [["Choose your sections", "Pick from the standard sections or add your own."], ["Share what you know", "Title, research summary, gap, method, dataset, results and references."], ["We draft each section", "You see which details are still missing for each section."], ["You edit and copy", "Check every claim and citation, then copy or export."]] };

const DEFAULT_SECTIONS = ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Experimental Setup', 'Results', 'Conclusion', 'References'];
// Which details each section needs before it can be written well.
const NEEDS = { 'Abstract': ['title', 'problem', 'gap', 'method', 'results'], 'Introduction': ['problem', 'gap'], 'Literature Review': ['gap', 'refs'], 'Methodology': ['method', 'data'], 'Experimental Setup': ['data', 'metrics'], 'Results': ['results', 'metrics'], 'Conclusion': ['gap', 'results'], 'References': ['refs'] };
const FIELDS = [
  { k: 'title', label: 'Paper title', kind: 'input', ph: 'Robust Road Accident Detection in Low-Resolution CCTV Video', req: true },
  { k: 'problem', label: 'What is your research about?', kind: 'area', ph: 'The problem you solve and why it matters', req: true },
  { k: 'gap', label: 'Research gap', kind: 'area', ph: 'What existing papers leave open' },
  { k: 'method', label: 'Methodology', kind: 'area', ph: 'Your model or approach' },
  { k: 'data', label: 'Dataset', kind: 'input', ph: 'CCD, DoTA, DAD' },
  { k: 'metrics', label: 'Evaluation metrics', kind: 'input', ph: 'Accuracy, F1-score, AUC' },
  { k: 'results', label: 'Your results', kind: 'area', ph: 'Paste your numbers, tables or key findings' },
  { k: 'refs', label: 'References', kind: 'area', ph: 'Paste your references, one per line' }
];
const TIPS = {
  'Abstract': 'Four to six sentences: problem, gap, method, main result. Write it last.',
  'Introduction': 'Why the problem matters, then the gap, then your contributions in a short list.',
  'Literature Review': 'Group papers by theme. For each theme say what it solved and what it left open, then lead into your gap.',
  'Methodology': 'Describe the model, preprocessing and training clearly enough for someone to repeat it.',
  'Experimental Setup': 'Datasets with splits, baselines, metrics, hardware and hyperparameters.',
  'Results': 'Show tables and figures first, then explain them. Compare with every baseline.',
  'Conclusion': 'Restate the gap and what you found, note limitations, suggest future work.',
  'References': 'Use one citation style and check every entry against the original paper.'
};

export function Writer({ notify }) {
  const [v, setV] = usePersist('writer:fields', {}); const [picked, setPicked] = usePersist('writer:sections', DEFAULT_SECTIONS); const [custom, setCustom] = useState('');
  const [texts, setTexts] = usePersist('writer:texts', null); const [tab, setTab] = usePersist('writer:tab', DEFAULT_SECTIONS[0]);
  const g = k => (v[k] || '').trim();
  const toggle = s => setPicked(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);
  const addCustom = () => { const s = custom.trim(); if (s && !picked.includes(s)) setPicked([...picked, s]); setCustom(''); };
  const neededBy = k => picked.filter(s => (NEEDS[s] || []).includes(k));
  const missing = FIELDS.filter(f => !g(f.k) && neededBy(f.k).length);
  const ready = g('title') && g('problem') && picked.length > 0;
  const [busy, setBusy] = useState(false);
  const generate = async () => { setBusy(true); try { const t = await api.writer.draft({ fields: v, sections: picked }); setTexts(t); setTab(picked[0]); notify(`Drafted ${picked.length} section${picked.length === 1 ? '' : 's'}. Review and edit them.`); } catch (e) { notify(`Could not draft: ${e.message}`); } finally { setBusy(false); } };
  const copyAll = () => { navigator.clipboard && navigator.clipboard.writeText(picked.map(s => `${s}\n\n${texts[s] || ''}`).join('\n\n\n')); notify('Full draft copied.'); };
  const current = picked.includes(tab) ? tab : picked[0];
  return <>
    <PageHero guide={GUIDE} icon={FileText} tone="sky" title="Draft paper" description="Share what you know about your research. Choose the sections you want and get a first draft of each one." chips={['Pick your sections', 'Paste results & references', 'Edit & copy']} action={texts && <button className="secondary-btn" onClick={copyAll}><Copy size={15} /> Copy full draft</button>} />
    <section className="panel pick-panel"><div><strong>Which sections should I write?</strong><small>Tap to add or remove. You can also add your own.</small></div>
      <div className="pick-chips">{DEFAULT_SECTIONS.map(s => <button key={s} className={picked.includes(s) ? 'on' : ''} onClick={() => toggle(s)}>{s}</button>)}{picked.filter(s => !DEFAULT_SECTIONS.includes(s)).map(s => <button key={s} className="on custom" onClick={() => toggle(s)}>{s} <X size={12} /></button>)}</div>
      <div className="add-section"><input value={custom} onChange={e => setCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustom()} placeholder="Add a section, e.g. Ethical considerations" /><button className="secondary-btn" onClick={addCustom} disabled={!custom.trim()}><Plus size={15} /> Add</button></div></section>
    <div className="draft-layout">
      <section className="panel draft-form"><div className="panel-head"><div><h3>About your paper</h3></div></div>
        {FIELDS.map(f => { const nb = neededBy(f.k); const need = !g(f.k) && nb.length; return <label className={`field ${need ? 'needed' : ''}`} key={f.k}>
          <span>{f.label}{f.req && <em> · required</em>}</span>
          {f.kind === 'input' ? <input value={v[f.k] || ''} placeholder={f.ph} onChange={e => setV({ ...v, [f.k]: e.target.value })} /> : <textarea rows={f.k === 'refs' || f.k === 'results' ? 4 : 3} value={v[f.k] || ''} placeholder={f.ph} onChange={e => setV({ ...v, [f.k]: e.target.value })} />}
          {need ? <small>Needed for {nb.join(', ')}</small> : null}</label>; })}
        <button className="primary-btn full" disabled={!ready || busy} onClick={generate}><Sparkles size={16} /> {busy ? 'Drafting…' : texts ? 'Redraft selected sections' : `Draft ${picked.length} section${picked.length === 1 ? '' : 's'}`}</button>
        <small className="form-note">{!ready ? 'Add a title, a short description and at least one section to start.' : missing.length ? `I can start now, but ${missing.map(f => f.label.toLowerCase()).join(', ')} would make the draft stronger.` : 'You have given me everything for these sections.'}</small></section>
      <section className="editor-panel"><div className="editor-tabs">{picked.map(t => <button className={current === t ? 'active' : ''} onClick={() => setTab(t)} key={t}>{t}</button>)}{!picked.length && <span className="no-sections">Choose at least one section above.</span>}</div>
        {current && <><div className="tip-box"><Lightbulb size={16} /><div><strong>What to write in {current.toLowerCase()}</strong><p>{TIPS[current] || 'Keep it focused and link it to your research gap.'}</p></div></div>
          {texts ? <textarea value={texts[current] ?? ''} onChange={e => setTexts({ ...texts, [current]: e.target.value })} /> : <div className="editor-empty">Your {current.toLowerCase()} will appear here once you draft.</div>}</>}
        <div className="editor-footer"><span><ShieldCheck size={13} /> This is an AI draft. Check every claim and citation before submitting.</span>{texts && current && <span>{(texts[current] || '').length} characters</span>}</div></section>
    </div>
  </>;
}
