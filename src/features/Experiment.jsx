import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ArrowRight, CheckCircle2, Database, Download, FlaskConical, GitBranch, Lightbulb, ShieldCheck, Target } from 'lucide-react';
import { SectionLabel, PageHero, Progress } from '../components/ui';
import { gaps } from '../data/mock';

const GUIDE = { what: 'Turns the gaps you selected into a practical plan. Every gap gets its own objective, methodology, datasets, baselines and evaluation metrics.', steps: [["Receive your selected gaps", "Gaps chosen in Research gaps appear here."], ["We write an objective and method", "One plan per gap, stating how to overcome it."], ["We suggest the setup", "Datasets, baselines and metrics to test your idea."], ["You use or export the plan", "Take it into your experiments and your paper."]] };

export function Experiment({ selectedGaps, onNavigate, notify }) {
  const [plans, setPlans] = useState({}); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { if (!selectedGaps.length) return; let live = true; setLoading(true); setError(''); api.experiment.plan(selectedGaps).then(p => live && setPlans(p)).catch(e => live && setError(e.message)).finally(() => live && setLoading(false)); return () => { live = false; }; }, [selectedGaps]);
  const Tags = ({ items }) => <div className="concepts">{items.map(i => <span key={i}>{i}</span>)}</div>;
  return <><PageHero guide={GUIDE} icon={FlaskConical} tone="teal" chips={['Objective', 'Datasets & baselines', 'Metrics']} title="Experiment plan" description="One plan for each research gap you selected." action={!!selectedGaps.length && <button className="secondary-btn" onClick={() => notify('Experiment plan exported as PDF (demo).')}><Download size={15} /> Export as PDF</button>} />
    {loading ? <Progress steps={['Reading your gaps', 'Choosing datasets and baselines', 'Writing the plans']} current={1} /> : error ? <div className="panel error-box">Could not build the plan: {error}</div> : !selectedGaps.length ? <div className="panel empty-state"><FlaskConical size={26} /><strong>No gaps selected</strong><span>Select one or more gaps in Research gaps and they will appear here with a full experiment plan.</span><button className="primary-btn" onClick={() => onNavigate('gaps')}>Go to Research gaps <ArrowRight size={15} /></button></div> : <>
      <section className="panel connected-gap"><div><SectionLabel>SELECTED GAPS</SectionLabel><h3>{selectedGaps.length} gap{selectedGaps.length === 1 ? '' : 's'} selected · {selectedGaps.length} experiment plan{selectedGaps.length === 1 ? '' : 's'}</h3>{selectedGaps.map(g => <div className="connected-gap-item" key={g.title}><CheckCircle2 size={15} /><span>{g.title}</span></div>)}</div><button className="text-btn" onClick={() => onNavigate('gaps')}>Change gaps</button></section>
      <div className="plan-list">{selectedGaps.map((g, i) => <article className="panel plan-card" key={g.title}>
        <header><span className="plan-index">Gap {i + 1}</span><h3>{g.title}</h3><p>{g.limit}</p></header>
        <div className="plan-grid">
          <div className="plan-item wide"><h4><Target size={14} /> Objective</h4><p>{(plans[g.title] || {}).objective}</p></div>
          <div className="plan-item wide"><h4><FlaskConical size={14} /> Methodology</h4><p>{(plans[g.title] || {}).methodology}</p></div>
          <div className="plan-item"><h4><Database size={14} /> Dataset</h4><Tags items={(plans[g.title] || {}).datasets || []} /></div>
          <div className="plan-item"><h4><GitBranch size={14} /> Baselines</h4><Tags items={(plans[g.title] || {}).baselines || []} /></div>
          <div className="plan-item"><h4><ShieldCheck size={14} /> Evaluation metrics</h4><Tags items={(plans[g.title] || {}).metrics || []} /></div>
          <div className="plan-item"><h4><Lightbulb size={14} /> Expected contribution</h4><p>{(plans[g.title] || {}).contribution}</p></div>
        </div></article>)}</div></>}
  </>;
}
