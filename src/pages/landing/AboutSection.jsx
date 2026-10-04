import React from 'react';
import { BookOpen, GraduationCap, ShieldCheck, Users } from 'lucide-react';

const cards = [
  [BookOpen, 'The problem we saw', 'Students starting research get stuck on the same early questions. Is my topic already done? What is still missing? What should I build, and how do I write it up? Most of it is learned by trial and error, and weeks are lost.'],
  [GraduationCap, 'What we built', 'One workspace with five tools: Explore, Novelty check, Research gaps, Experiment plan and Draft paper. Each one works on its own, and the gaps you choose flow straight into your experiment plan.'],
  [Users, 'Humans in the loop', 'AI gets you started, but research needs judgement. Verified mentors can review your gap, plan or draft, so you are never guessing alone.']
];
const principles = [
  ['Evidence first', 'Suggestions are linked to real papers, so you can check where an idea came from.'],
  ['The student decides', 'We draft and suggest. You verify, edit and own the final work.'],
  ['Simple to start', 'Type your idea in plain words. No setup, no jargon.']
];

export function AboutSection() {
  return <section className="landing-section about-section" id="about">
    <div className="section-intro"><span>ABOUT US</span><h2>A research guide for students who do not know where to start.</h2></div>
    <p className="about-lead">Research Mentor AI is a student-built project. It takes a student from a rough idea to a defensible research paper: finding related work, checking how new the idea is, spotting gaps, planning experiments and drafting the paper. Every step stays tied to real published research, and a human mentor is one click away.</p>
    <div className="about-cards">{cards.map(([Icon, t, d]) => <article key={t}><span className="about-ic"><Icon size={20} /></span><h3>{t}</h3><p>{d}</p></article>)}</div>
    <div className="panel-dark about-beliefs"><h3 className="about-h"><ShieldCheck size={20} /> What we believe</h3><div className="belief-grid">{principles.map(([t, d]) => <div className="belief" key={t}><strong>{t}</strong><span>{d}</span></div>)}</div></div>
  </section>;
}
