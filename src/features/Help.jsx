import React, { useState } from 'react';
import { Check, CircleHelp, Sparkles } from 'lucide-react';
import { SectionLabel, PageTitle } from '../components/ui';
import { papers, gaps, mentors } from '../data/mock';

export function HelpGuide({ onNavigate }) {
  const sections = [
    [
      '1',
      'Start with Explore',
      'Enter a clear problem statement. Refine it, read the generated topic context, then inspect related papers before moving forward.',
      'explore'
    ],
    [
      '2',
      'Check novelty',
      'Submit your problem statement and compare similarity evidence with the closest papers. A score is an aid for investigation, not proof of novelty.',
      'novelty'
    ],
    [
      '3',
      'Find research gaps',
      'Upload a paper or use papers from Explore. Read each evidence-backed gap and open its source excerpts before selecting one or more gaps.',
      'gaps'
    ],
    [
      '4',
      'Build the experiment plan',
      'Review the connected gaps, then choose datasets, baselines and evaluation metrics. Keep every choice linked to a source.',
      'experiment'
    ],
    [
      '5',
      'Draft the paper',
      'Draft section by section, inspect citations, edit the generated text, and verify every reference before academic use.',
      'paper'
    ],
    [
      '6',
      'Use mentors when needed',
      'Book a mentor for gap review, experiment-plan review or draft review. Prepare your selected evidence before the session.',
      'mentors'
    ]
  ];

  return (
    <>
      <PageTitle
        eyebrow="HELP CENTER"
        title="Help & guide"
        description="A step-by-step guide for completing your research project without skipping important evidence checks."
      />

      <section className="help-hero">
        <div>
          <span className="hero-badge">
            <CircleHelp size={14} />
            RESEARCH TOOLS GUIDE
          </span>

          <h2>Use each tool on its own</h2>

          <p>
            Explore, Novelty check, Research gaps, Experiment plan and Draft
            paper work independently. Only Research gaps and Experiment plan
            are linked: the gaps you select become your experiment plan.
          </p>
        </div>

        <div className="help-visual">
          <Sparkles size={42} />
          <span>Research decisions stay connected to sources.</span>
        </div>
      </section>

      {/* Clickable Help Options */}
      <div className="help-grid">
        {sections.map(([n, title, description, route]) => (
          <button
            type="button"
            className="help-card"
            key={n}
            onClick={() => onNavigate(route)}
          >
            <span>{n}</span>

            <div>
              <h3>{title}</h3>
              <p>{description}</p>

              <div className="help-card-action">
                Open guide →
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}