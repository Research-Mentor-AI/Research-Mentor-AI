import React from 'react';
import { Info } from 'lucide-react';

export function SectionLabel({ children }) { return <div className="section-label">{children}</div>; }

export function PageTitle({ eyebrow, title, description, action }) {
  return <div className="page-title"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

// Coloured banner that opens every feature page.
export function PageHero({ icon: Icon, title, description, chips = [], tone = 'indigo', action, guide }) {
  return <><section className={`page-hero hero-${tone}`}>
    <div className="hero-ic"><Icon size={26} /></div>
    <div className="hero-txt"><h2>{title}</h2><p>{description}</p>{!!chips.length && <div className="hero-chips">{chips.map(c => <span key={c}>{c}</span>)}</div>}</div>
    {action && <div className="hero-act">{action}</div>}
  </section>{guide && <FeatureGuide {...guide} tone={tone} />}</>;
}

export const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';

// Stage-by-stage progress shown while the backend works.
export function Progress({ steps, current }) {
  return <div className="panel progress-card" role="status"><ol>{steps.map((s, i) => <li key={s} className={i < current ? 'done' : i === current ? 'now' : ''}><i>{i < current ? '✓' : ''}</i>{s}</li>)}</ol></div>;
}

export function StatStrip({ items }) {
  return <div className="stat-strip">{items.map(([l, v]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div>;
}

// "About this tool" block: what the feature does and its workflow from start to finish.
export function FeatureGuide({ what, steps, tone = 'indigo' }) {
  return <details className={`feature-guide guide-${tone}`} open>
    <summary><span className="fg-title"><Info size={16} /> About this tool</span><span className="fg-hint">Show or hide</span></summary>
    <div className="fg-body">
      <p className="fg-what">{what}</p>
      <ol className="fg-flow">{steps.map(([t, d], i) => <li key={t}><b>{i + 1}</b><div><strong>{t}</strong><span>{d}</span></div></li>)}</ol>
    </div>
  </details>;
}
