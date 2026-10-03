import React from 'react';

const steps = [
  ['Explore', 'Understand your problem', 'Describe your idea in plain words.', 'We identify the domain and key concepts, then retrieve the closest published papers and rank them by similarity.', 'A research brief: objectives, questions, datasets, methodology, challenges, and a list of related papers.'],
  ['Novelty check', 'Test how new it is', 'Paste your problem statement.', 'We compare it with published work and measure how much it overlaps.', 'A novelty score out of 100, your novel contributions, the overlapping papers and a publication-readiness checklist.'],
  ['Research gaps', 'Find what is missing', 'Upload a paper you want to build on.', 'We read its limitations and future-work notes and turn them into clear gaps with evidence.', 'A list of gaps. Each shows what the paper does, its limitation, the improvement opportunity and the impact. You select the ones to solve.'],
  ['Experiment plan', 'Plan how to solve it', 'Nothing. Your selected gaps arrive here automatically.', 'We build one plan per gap, choosing suitable datasets, baselines and metrics.', 'For each gap: objective, methodology, dataset, baselines, evaluation metrics and expected contribution.'],
  ['Draft paper', 'Write it up', 'Choose your sections and share your title, research summary, results and references.', 'We draft each section and tell you which details are still missing.', 'A first draft of every section you picked, ready to edit, check and copy.'],
  ['Mentors', 'Get a human review', 'Add a date and time that suits you.', 'We match you with verified mentors by expertise and confirm the slot.', 'Expert feedback on your gap, plan or draft.']
];
const flow = ['Your input', 'Retrieval from papers', 'AI reasoning', 'Source-linked output', 'You verify'];

export function HowSection() {
  return <section className="landing-section how-section" id="workflow">
    <div className="section-intro center"><span>HOW IT WORKS</span><h2>From a rough idea to a finished draft, in six clear steps.</h2><p>Follow the steps in order, or jump straight to the tool you need. Each one works on its own.</p></div>
    <ol className="how-steps">{steps.map(([tool, title, you, we, get], i) => <li key={tool} className="how-step">
      <div className="how-num">{i + 1}</div>
      <div className="how-body"><div className="how-head"><h3>{title}</h3><span className="how-tool">{tool}</span></div>
        <div className="how-cols"><div><small>You do</small><p>{you}</p></div><div><small>We do</small><p>{we}</p></div><div><small>You get</small><p>{get}</p></div></div></div>
    </li>)}</ol>
    <div className="how-behind"><strong>Behind the scenes</strong><div className="how-flow">{flow.map((f, i) => <React.Fragment key={f}><span>{f}</span>{i < flow.length - 1 && <i />}</React.Fragment>)}</div><p>Every suggestion is built from retrieved papers rather than guesswork, and the final judgement always stays with you.</p></div>
  </section>;
}
