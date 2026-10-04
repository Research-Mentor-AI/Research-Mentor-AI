import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Database, Download, ExternalLink, FlaskConical, GitBranch, Lightbulb, Target, Wrench, BarChart3, BookOpen } from 'lucide-react';
import { SectionLabel, PageHero, Progress } from '../components/ui';
import { api } from '../api/client';
import { download } from '../lib/download';

const GUIDE = { what: 'Turns the gaps you selected into a complete experiment you can run. For every gap you get a plain explanation of how to overcome it, a step-by-step plan from data to results, and the datasets, baselines, tools, metrics and reading material to use.', steps: [['Receive your selected gaps', 'Gaps chosen in Research gaps appear here.'], ['Read how to overcome each gap', 'A short explanation in plain words.'], ['Follow the end-to-end plan', 'Phases from data preparation to reporting.'], ['Use the resources', 'Datasets, baselines, tools, metrics and papers to read.']] };

const Sub = ({ icon: I, title, children, wide }) => <div className={`plan-item ${wide ? 'wide' : ''}`}><h4><I size={14} /> {title}</h4>{children}</div>;
const Ext = ({ href, children }) => <a className="ext-link" href={href} target="_blank" rel="noreferrer">{children} <ExternalLink size={11} /></a>;

function toMarkdown(gaps, plans) {
  return gaps.map(g => { const p = plans[g.title]; if (!p || p.error) return `# ${g.title}\n\nNo plan available.\n`;
    return [`# ${g.title}`, `## How to overcome this gap\n${p.summary}`, `## Objective\n${p.objective}`, `## Methodology\n${p.methodology}`,
      `## Step-by-step plan\n` + p.steps.map((s, i) => `${i + 1}. **${s.phase}**\n${s.tasks.map(t => `   - ${t}`).join('\n')}\n   - Outcome: ${s.outcome}`).join('\n'),
      `## Datasets\n` + p.datasets.map(d => `- **${d.name}**: ${d.description} (${d.why}) ${d.url}`).join('\n'),
      `## Baselines\n` + p.baselines.map(b => `- **${b.name}**: ${b.description} ${b.url}`).join('\n'),
      `## Tools\n` + p.tools.map(t => `- ${t}`).join('\n'), `## Evaluation metrics\n` + p.metrics.map(m => `- **${m.name}**: ${m.why}`).join('\n'),
      `## Expected contribution\n${p.expected_contribution}`, `## Risks\n` + p.risks.map(r => `- ${r}`).join('\n'),
      `## Reading list\n` + p.resources.map(r => `- ${r.title} (${r.year}) ${r.url}`).join('\n')].join('\n\n'); }).join('\n\n---\n\n');
}

export function Experiment({ selectedGaps, onNavigate }) {
  const [plans, setPlans] = useState({}); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (!selectedGaps.length) return undefined;
    let live = true; setLoading(true); setError(''); setPlans({});
    const slim = selectedGaps.map(({ title, explanation, done, limit, improve, search_query }) => ({ title, explanation, done, limit, improve, search_query }));
    api.experiment.plan(slim).then(r => live && setPlans(r.plans)).catch(e => live && setError(e.message)).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [selectedGaps]);
  const ready = Object.values(plans).some(p => !p.error);
  return <>
    <PageHero guide={GUIDE} icon={FlaskConical} tone="teal" chips={['How to overcome the gap', 'Step-by-step plan', 'Datasets, baselines & papers']} title="Experiment plan" description="One complete experiment for each research gap you selected." action={ready && <button className="secondary-btn" onClick={() => download('experiment-plan.md', toMarkdown(selectedGaps, plans), 'text/markdown')}><Download size={15} /> Download plan</button>} />
    {!selectedGaps.length ? <div className="panel empty-state"><FlaskConical size={26} /><strong>No gaps selected</strong><span>Select one or more gaps in Research gaps and they will appear here with a full experiment plan.</span><button className="primary-btn" onClick={() => onNavigate('gaps')}>Go to Research gaps <ArrowRight size={15} /></button></div> : <>
      <section className="panel connected-gap"><div><SectionLabel>SELECTED GAPS</SectionLabel><h3>{selectedGaps.length} gap{selectedGaps.length === 1 ? '' : 's'} selected</h3>{selectedGaps.map(g => <div className="connected-gap-item" key={g.id}><CheckCircle2 size={15} /><span>{g.title}</span></div>)}</div><button className="text-btn" onClick={() => onNavigate('gaps')}>Change gaps</button></section>
      {loading && <Progress steps={['Reading your gaps', 'Designing the experiments', 'Finding reading material']} current={1} />}
      {error && <div className="panel error-box">Could not build the plan: {error}</div>}
      <div className="plan-list">{!loading && selectedGaps.map((g, i) => { const p = plans[g.title]; if (!p) return null;
        if (p.error) return <article className="panel plan-card" key={g.id}><header><span className="plan-index">Gap {i + 1}</span><h3>{g.title}</h3></header><div className="error-box inline">Could not build this plan: {p.error}</div></article>;
        return <article className="panel plan-card" key={g.id}>
          <header><span className="plan-index">Gap {i + 1}</span><h3>{g.title}</h3><p>{g.limit}</p></header>
          <div className="overcome"><h4><Lightbulb size={15} /> How to overcome this gap</h4><p>{p.summary}</p></div>
          <div className="plan-grid">
            <Sub icon={Target} title="Objective" wide><p>{p.objective}</p></Sub>
            <Sub icon={FlaskConical} title="Methodology" wide><p>{p.methodology}</p></Sub>
          </div>
          <h4 className="phase-title">The experiment, end to end</h4>
          <ol className="phases">{p.steps.map((s, k) => <li key={s.phase + k}><b>{k + 1}</b><div><strong>{s.phase}</strong><ul>{s.tasks.map(t => <li key={t}>{t}</li>)}</ul><em>Outcome: {s.outcome}</em></div></li>)}</ol>
          <div className="plan-grid three">
            <Sub icon={Database} title="Datasets">{p.datasets.map(d => <div className="res-row" key={d.name}><strong>{d.name}</strong><span>{d.description}</span><small>{d.why}</small><Ext href={d.url}>Find this dataset</Ext></div>)}</Sub>
            <Sub icon={GitBranch} title="Baselines">{p.baselines.map(b => <div className="res-row" key={b.name}><strong>{b.name}</strong><span>{b.description}</span><Ext href={b.url}>Find papers</Ext></div>)}</Sub>
            <Sub icon={BarChart3} title="Evaluation metrics">{p.metrics.map(m => <div className="res-row" key={m.name}><strong>{m.name}</strong><span>{m.why}</span></div>)}</Sub>
            <Sub icon={Wrench} title="Tools and libraries"><div className="concepts">{p.tools.map(t => <span key={t}>{t}</span>)}</div></Sub>
            <Sub icon={Lightbulb} title="Expected contribution"><p>{p.expected_contribution}</p></Sub>
            <Sub icon={AlertTriangle} title="Risks to watch"><ul className="plain-list">{p.risks.map(r => <li key={r}>{r}</li>)}</ul></Sub>
          </div>
          {p.resources.length > 0 && <Sub icon={BookOpen} title="Supporting papers to read" wide><div className="reading">{p.resources.map(r => <a key={r.url + r.title} href={r.url} target="_blank" rel="noreferrer"><strong>{r.title}</strong><small>{r.venue || r.publisher} · {r.year}</small></a>)}</div></Sub>}
        </article>; })}</div></>}
  </>;
}
