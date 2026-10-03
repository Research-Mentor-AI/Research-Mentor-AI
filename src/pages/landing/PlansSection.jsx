import React, { useState } from 'react';
import { Check } from 'lucide-react';

const base = ['Explore: problem analysis and related papers', 'Novelty check with score and overlap', 'Research gap detection from your papers', 'Experiment plans for the gaps you select', 'Draft paper, free'];
const plans = [
  { name: 'Student', tag: 'For your first research project', month: 299, year: 2990, features: [...base, 'Book mentors at per-session rates'] },
  { name: 'Plus', tag: 'Add expert guidance', month: 1100, year: 11000, popular: true, sessions: '1 mentorship session every month', features: ['Everything in Student', '1 mentorship session per month', 'Mentor review of a gap, plan or draft', 'SMS reminder before every session'] },
  { name: 'Pro', tag: 'For serious research and publication', month: 2499, year: 24990, sessions: '2 mentorship sessions every month', features: ['Everything in Plus', '2 mentorship sessions per month', 'Choose any verified mentor', 'Priority slot booking', 'Draft paper, free, with a mentor review before you submit'] }
];
const fmt = n => '₹' + n.toLocaleString('en-IN');

export function PlansSection({ onSignup }) {
  const [yearly, setYearly] = useState(false);
  return <section className="plans-section" id="plans">
    <div className="section-intro center"><span>PLANS</span><h2>Pick the support that fits your research.</h2><p>Draft paper is free in every plan.</p></div>
    <div className="bill-toggle" role="group" aria-label="Billing period"><button className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>Monthly</button><button className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>Yearly <em>2 months free</em></button></div>
    <div className="pricing-grid">{plans.map(p => <article key={p.name} className={`pricing-card ${p.popular ? 'popular' : ''}`}>
      {p.popular && <span className="pricing-badge">Most popular</span>}
      <h3>{p.name}</h3><p className="pricing-tag">{p.tag}</p>
      <div className="pricing-price"><strong>{fmt(yearly ? p.year : p.month)}</strong><span>{yearly ? '/year' : '/month'}</span></div>
      <small className="pricing-sub">{yearly ? `${fmt(Math.round(p.year / 12))}/month, billed yearly` : 'Billed monthly. Cancel anytime.'}</small>
      <button className="pricing-cta" onClick={onSignup}>Choose {p.name}</button>
      <ul>{p.features.map(f => <li key={f}><Check size={15} />{f}</li>)}</ul>
    </article>)}</div>
  </section>;
}
