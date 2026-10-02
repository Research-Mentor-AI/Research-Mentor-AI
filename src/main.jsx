import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, BookOpen, CalendarDays, Check, ChevronDown, ChevronRight, CircleHelp,
  Clock3, Database, Download, Edit3, ExternalLink, FileText, FlaskConical,
  FolderKanban, GitBranch, Globe2, GraduationCap, Info, LayoutDashboard, Lightbulb, Menu,
  MoreHorizontal, Paperclip, Search, Send, ShieldCheck, Sparkles, Star, Target,
  UploadCloud, Users, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import './styles.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'explore', label: 'Explore', icon: Search },
  { id: 'gaps', label: 'Research gaps', icon: Lightbulb },
  { id: 'experiment', label: 'Experiment plan', icon: FlaskConical },
  { id: 'novelty', label: 'Novelty check', icon: Target },
  { id: 'writer', label: 'Draft paper', icon: FileText },
  { id: 'mentors', label: 'My mentors', icon: Users },
  { id: 'projects', label: 'My projects', icon: FolderKanban }
];

const pipeline = [
  { id: 'explore', label: 'Explore' },
  { id: 'gaps', label: 'Research gaps' },
  { id: 'experiment', label: 'Experiment plan' },
  { id: 'novelty', label: 'Novelty check' },
  { id: 'writer', label: 'Draft paper' }
];

const papers = [
  { title: 'Deep learning for automatic traffic accident detection', publisher: 'IEEE Access', year: 2024, date: '18 Apr 2024', similarity: 87, type: 'Conference', source: 'IEEE Xplore' },
  { title: 'Vision-based crash recognition in surveillance video', publisher: 'Pattern Recognition', year: 2023, date: '07 Sep 2023', similarity: 82, type: 'Journal', source: 'ScienceDirect' },
  { title: 'Spatiotemporal networks for road event detection', publisher: 'Expert Systems with Applications', year: 2024, date: '12 Jan 2024', similarity: 76, type: 'Journal', source: 'Elsevier' },
  { title: 'Real-time accident recognition using video transformers', publisher: 'Applied AI', year: 2025, date: '03 Feb 2025', similarity: 68, type: 'Conference', source: 'ACM Digital Library' }
];

const gaps = [
  {
    title: 'Limited performance in low-resolution CCTV footage',
    evidence: 'Supported by 7 papers', tone: 'green',
    done: 'Existing accident-detection approaches are mostly evaluated on curated or higher-quality footage.',
    improve: 'Evaluate robust video models on low-resolution surveillance footage and compare performance degradation.',
    source: 'IEEE Access · 2024 · Limitations', quotes: ['Performance decreases as image resolution and compression artifacts increase.', 'Future evaluations should include more realistic surveillance conditions.']
  },
  {
    title: 'Weak coverage of night-time accident scenarios',
    evidence: 'Supported by 5 papers', tone: 'amber',
    done: 'Several studies report strong daytime results but limited evaluation across low-light road conditions.',
    improve: 'Build a balanced day/night evaluation split and measure robustness under low-light conditions.',
    source: 'Pattern Recognition · 2023 · Future Work', quotes: ['Night-time scenarios remain underrepresented in current benchmarks.', 'Future datasets should include diverse lighting conditions.']
  },
  {
    title: 'Limited cross-dataset generalization',
    evidence: 'Supported by 6 papers', tone: 'grey',
    done: 'Many models are validated mainly on the same benchmark used during development.',
    improve: 'Test the selected baseline and proposed model on an independent dataset.',
    source: 'Expert Systems with Applications · 2024 · Discussion', quotes: ['Cross-dataset validation is necessary to assess generalization.', 'Independent benchmarks can expose dataset-specific bias.']
  }
];

const datasets = [
  ['Car Crash Dataset (CCD)', '1,500+ clips', 'Research use', 'View source'],
  ['DoTA', '4,677 videos', 'CC BY-NC', 'View source'],
  ['DAD', '620 sequences', 'Research use', 'View source'],
  ['Nexar Dashcam', '1,500+ clips', 'Research use', 'View source']
];

const baselines = [
  ['CNN baseline', 'Traffic accident detection · 2023', true],
  ['CNN + LSTM', 'Spatiotemporal crash recognition · 2024', true],
  ['Video Transformer', 'Real-time accident recognition · 2025', false]
];

const metrics = ['Accuracy', 'Precision', 'Recall', 'F1-score', 'AUC'];

const mentors = [
  { name: 'Dr. Priya Sharma', role: 'ML Research', initials: 'PS', expertise: ['Computer Vision', 'Deep Learning', 'Research Design'], rating: '4.9', price: '₹799/session' },
  { name: 'Dr. Arjun Mehta', role: 'AI & NLP Research', initials: 'AM', expertise: ['NLP', 'RAG', 'Paper Writing'], rating: '4.8', price: '₹699/session' },
  { name: 'Dr. Neha Verma', role: 'Data Science Research', initials: 'NV', expertise: ['ML', 'Statistics', 'Experiments'], rating: '4.9', price: '₹599/session' }
];

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [publicPage, setPublicPage] = useState('home');
  const [active, setActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedGaps, setSelectedGaps] = useState([gaps[0]]);
  const [toast, setToast] = useState('');
  const [mentor, setMentor] = useState(null);
  const [booking, setBooking] = useState(null);
  const notify = (message) => { setToast(message); window.clearTimeout(window.__rmToast); window.__rmToast = window.setTimeout(() => setToast(''), 2600); };
  const login = () => { localStorage.setItem('rm-auth','1'); setAuthenticated(true); setActive('dashboard'); };
  const logout = () => { localStorage.removeItem('rm-auth'); setAuthenticated(false); setPublicPage('home'); };
  const navigate = (id) => { setActive(id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const currentIndex = pipeline.findIndex(p => p.id === active);
  if (!authenticated) {
    if (publicPage === 'home') return <LandingPage onLogin={() => {setPublicPage('auth');setAuthView('login')}} onSignup={() => {setPublicPage('auth');setAuthView('signup')}} />;
    if (authView === 'login') return <LoginPage onLogin={login} onSignup={() => setAuthView('signup')} onBack={() => {setAuthView('login');setPublicPage('home')}} />;
    return <SignupPage onSignup={login} onLogin={() => setAuthView('login')} />;
  }
  return <div className="app-shell">
    <Sidebar active={active} onNavigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={logout} />
    <main className="main-shell"><header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><div className="crumbs"><span>My Projects</span><span>/</span><strong>Road Accident Detection</strong></div><div className="top-actions"><button className="icon-button" onClick={() => navigate('help')}><CircleHelp size={19}/></button><button className="avatar">AP</button></div></header>
      <div className="content">{active !== 'help' && <ProjectHeader onContinue={() => navigate(pipeline[Math.min(Math.max(currentIndex + 1, 0), pipeline.length - 1)].id)} />}{active !== 'help' && <Pipeline active={active} onNavigate={navigate} />}
        {active === 'dashboard' && <Dashboard onNavigate={navigate}/>} {active === 'explore' && <Explore onNavigate={navigate}/>} {active === 'gaps' && <Gaps selectedGaps={selectedGaps} setSelectedGaps={setSelectedGaps} onNavigate={navigate} notify={notify}/>} {active === 'experiment' && <Experiment selectedGaps={selectedGaps} onNavigate={navigate} notify={notify}/>} {active === 'novelty' && <Novelty onNavigate={navigate}/>} {active === 'writer' && <Writer notify={notify}/>} {active === 'mentors' && <Mentors mentor={mentor} setMentor={setMentor} booking={booking} setBooking={setBooking} notify={notify}/>} {active === 'projects' && <Projects onNavigate={navigate}/>} {active === 'help' && <HelpGuide onNavigate={navigate}/>}</div>
    </main>{toast && <div className="toast"><CheckCircle2 size={16}/>{toast}</div>}</div>;
}

function Sidebar({
  active,
  onNavigate,
  mobileOpen,
  onClose,
  onLogout
}) {

  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {mobileOpen && (
        <div
          className="overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "open" : ""
        }`}
      >

        {/* BRAND */}
        <div className="brand">

          <div className="brand-mark">
            <Sparkles size={19} />
          </div>

          <div>
            <div className="brand-title">
              Research Mentor
            </div>

            <div className="brand-sub">
              AI research workspace
            </div>
          </div>

          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>


        {/* NAVIGATION */}
        <div className="nav-label">
          Workspace
        </div>

        <nav>

          {navItems.map(
            ({
              id,
              label,
              icon: Icon
            }) => (

              <button
                type="button"
                key={id}
                className={`nav-item ${
                  active === id ? "active" : ""
                }`}
                onClick={() => {
                  setProfileOpen(false);
                  onNavigate(id);
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>

            )
          )}

        </nav>


        {/* BOTTOM */}
        <div className="sidebar-bottom">

          {/* HELP */}
          <button
            type="button"
            className={`nav-item ${
              active === "help" ? "active" : ""
            }`}
            onClick={() => {
              setProfileOpen(false);
              onNavigate("help");
            }}
          >
            <CircleHelp size={18} />
            <span>Help & guide</span>
          </button>


          {/* PROFILE */}
          <div
            style={{
              position: "relative",
              width: "100%",
            }}
          >

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                setProfileOpen(
                  (prev) => !prev
                );
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 6px",
                border: "none",
                borderRadius: "10px",
                background: "transparent",
                cursor: "pointer",
                color: "inherit",
                textAlign: "left",
              }}
            >

              <div className="avatar small">
                AP
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <strong>
                  Amartya
                </strong>

                <span>
                  Student workspace
                </span>
              </div>

              <MoreHorizontal
                size={18}
                style={{
                  marginLeft: "auto",
                  opacity: 0.7,
                }}
              />

            </button>


            {profileOpen && (

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: "calc(100% + 10px)",
                  width: "250px",
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "10px",
                  boxShadow:
                    "0 20px 50px rgba(15,23,42,.25)",
                  zIndex: 99999,
                  color: "#0f172a",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px",
                  }}
                >

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg,#6366f1,#8b5cf6)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    AP
                  </div>

                  <div>
                    <strong
                      style={{
                        display: "block",
                      }}
                    >
                      Amartya
                    </strong>

                    <span
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                      }}
                    >
                      Student workspace
                    </span>
                  </div>

                </div>


                <div
                  style={{
                    height: "1px",
                    background: "#e2e8f0",
                    margin: "7px 0",
                  }}
                />


                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate("projects");
                  }}
                  style={profileMenuButton}
                >
                  📁 My projects
                </button>


                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate("help");
                  }}
                  style={profileMenuButton}
                >
                  ❓ Help & guide
                </button>


                <div
                  style={{
                    height: "1px",
                    background: "#e2e8f0",
                    margin: "7px 0",
                  }}
                />


                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  style={{
                    ...profileMenuButton,
                    color: "#e11d48",
                    background: "#fff1f2",
                    fontWeight: 600,
                  }}
                >
                  ↪ Log out
                </button>

              </div>

            )}

          </div>

        </div>

      </aside>
    </>
  );
}


function ProjectHeader({ onContinue }) {
  return <section className="project-head"><div><div className="eyebrow"><span className="live-dot"/> ACTIVE PROJECT</div><h1>Road Accident Detection</h1><p>Computer vision · traffic surveillance · deep learning</p></div><div className="head-actions"><button className="secondary-btn"><MoreHorizontal size={18}/> Project options</button><button className="primary-btn" onClick={onContinue}>Continue pipeline <ArrowRight size={17}/></button></div></section>;
}

function Pipeline({ active, onNavigate }) {
  const activeIndex = pipeline.findIndex(p => p.id === active);
  return <div className="pipeline-card"><div className="pipeline-copy"><span>RESEARCH WORKFLOW</span><strong>{activeIndex >= 0 ? `Step ${activeIndex + 1} of ${pipeline.length}` : 'Workspace'}</strong></div><div className="pipeline-steps">{pipeline.map((step, i) => { const done = activeIndex > i; const current = active === step.id; return <React.Fragment key={step.id}><button className={`pipeline-step ${done ? 'done' : ''} ${current ? 'current' : ''}`} onClick={() => onNavigate(step.id)}><span className="step-circle">{done ? <Check size={13}/> : i + 1}</span><span>{step.label}</span></button>{i < pipeline.length - 1 && <span className={`connector ${activeIndex > i ? 'filled' : ''}`}/>}</React.Fragment>; })}</div></div>;
}

function PageTitle({ eyebrow, title, description, action }) { return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div>{action}</div>; }
function Stats() { return <div className="stats-grid"><Stat icon={BookOpen} label="Papers analyzed" value="128" meta="+24 this week"/><Stat icon={Lightbulb} label="Gaps found" value="18" meta="6 strong evidence"/><Stat icon={ShieldCheck} label="Citations verified" value="96%" meta="214 / 223 claims" good/></div>; }
function Stat({icon:Icon,label,value,meta,good}) { return <div className="stat-card"><div className="stat-icon"><Icon size={18}/></div><div><span>{label}</span><strong>{value}</strong><small className={good?'good':''}>{meta}</small></div></div>; }
function SectionLabel({children}) { return <div className="section-label">{children}</div>; }
function StepGuide({ title='How to proceed', steps, current=0 }) { return <details className="guide-card" open><summary><div className="guide-title"><span className="guide-icon"><Info size={17}/></span><div><strong>{title}</strong><small>Follow these steps in order</small></div></div><ChevronDown size={17}/></summary><div className="guide-steps">{steps.map((s,i)=><div className={`guide-step ${i<current?'complete':''} ${i===current?'current':''}`} key={i}><span>{i<current?<Check size={13}/>:i+1}</span><div><strong>{s}</strong>{i===current&&<small>Current step</small>}</div></div>)}</div></details>; }

function Dashboard({onNavigate}) {
  const projects=[['AI in Education',60,'Research gaps'],['Fake News Detection',20,'Explore'],['Road Accident Detection',45,'Experiment plan']];
  return <>
    <PageTitle eyebrow="WORKSPACE OVERVIEW" title="Dashboard" description="Continue your research journey from one place." action={<button className="secondary-btn"><CalendarDays size={16}/> Recent activity</button>}/>
    <div className="dashboard-hero-grid">
      <section className="hero-card"><div className="hero-badge"><Sparkles size={15}/> AI RESEARCH MENTOR</div><h2>Start a new research project</h2><p>Turn a problem statement into a grounded research plan, step by step.</p><div className="hero-input"><input placeholder="Enter your problem statement or research interest"/><button className="primary-btn" onClick={()=>onNavigate('explore')}>Go <ArrowRight size={17}/></button></div><small><ShieldCheck size={14}/> Every output is linked to retrieved research papers.</small></section>
      <div className="quick-links">{[['Datasets','24','Explore datasets',Database,'explore'],['Research papers','128','View papers',BookOpen,'explore'],['Other info','42','Sources & notes',Globe2,'explore']].map(([label,count,meta,Icon,id])=><button className="quick-card" key={label} onClick={()=>onNavigate(id)}><div className="quick-icon"><Icon size={17}/></div><div><strong>{label}</strong><span>{count}</span><small>{meta}</small></div><ArrowRight size={16}/></button>)}</div>
    </div>
    <section className="panel explore-preview"><div className="panel-head"><div><SectionLabel>EXPLORE PREVIEW</SectionLabel><h3>Explore → Papers</h3></div><button className="text-btn" onClick={()=>onNavigate('explore')}>Open Explore <ArrowRight size={15}/></button></div><div className="explore-flow"><div className="flow-node"><Search size={17}/><strong>Explore</strong><span>Road accident detection</span></div><ChevronRight className="flow-arrow" size={22}/>{papers.slice(0,3).map((p)=><div className="mini-paper" key={p.title}><BookOpen size={15}/><div><strong>{p.title}</strong><span>{p.publisher} · {p.year}</span></div><ExternalLink size={13}/></div>)}</div></section>
    <div className="panel-head projects-head"><div><SectionLabel>MY PROJECTS</SectionLabel><h3>Pick up where you left off</h3></div><button className="text-btn" onClick={()=>onNavigate('projects')}>View all</button></div><div className="project-grid">{projects.map(([name,progress,step])=><ProjectCard key={name} name={name} progress={progress} step={step} onContinue={()=>onNavigate(step==='Explore'?'explore':step==='Research gaps'?'gaps':'experiment')}/>)}</div>
    <Stats/><div className="grounding-note"><ShieldCheck size={17}/><span><strong>Grounded by design.</strong> Every output links to a real paper.</span></div>
  </>;
}
function ProjectCard({name,progress,step,onContinue}) { return <div className="project-card"><div className="project-card-top"><div className="project-icon"><FolderKanban size={17}/></div><span className="progress-number">{progress}%</span></div><h3>{name}</h3><span>Current step: {step}</span><div className="progress-track"><i style={{width:`${progress}%`}}/></div><button className="secondary-btn full" onClick={onContinue}>Continue <ArrowRight size={15}/></button></div>; }

function Explore({onNavigate}) {
  const [filter,setFilter]=useState('All'); const [year,setYear]=useState('All'); const [editing,setEditing]=useState(false); const [ps,setPs]=useState('How can deep learning detect road accidents reliably from real-world CCTV footage?');
  const visible=papers.filter(p=>(filter==='All'||p.type===filter)&&(year==='All'||String(p.year)===year));
  return <>
    <PageTitle eyebrow="STEP 1 · EXPLORE" title="Explore" description="Understand your problem statement and discover the papers closest to it." action={<button className="secondary-btn"><Download size={15}/> Export sources</button>}/>
    <StepGuide current={0} steps={['Review and refine your problem statement.','Read the AI-generated topic information.','Compare related papers and their similarity.','Continue to Research gaps when the evidence is relevant.']}/>
    <div className="explore-grid split-layout"><section className="explore-left"><SectionLabel>INFORMATION ABOUT YOUR PROBLEM STATEMENT</SectionLabel><div className="panel ps-card"><div className="ps-head"><span>Problem statement</span><button className="icon-button" onClick={()=>setEditing(!editing)}><Edit3 size={16}/></button></div>{editing?<textarea value={ps} onChange={e=>setPs(e.target.value)}/>:<p>{ps}</p>}<button className="secondary-btn save-btn" onClick={()=>setEditing(false)}><Check size={15}/> Save information</button></div><div className="panel ai-info"><div className="ai-head"><span className="ai-spark"><Sparkles size={15}/></span><div><strong>AI-generated information</strong><small>Generated from retrieved papers</small></div><button className="secondary-btn" onClick={()=>{}}><Search size={14}/> Search again</button></div><p>Road accident detection combines computer vision, video understanding and temporal modeling to identify crash events in surveillance footage. Key concepts include object detection, spatiotemporal features, video transformers and anomaly recognition.</p><div className="concepts"><span>Computer Vision</span><span>Video Understanding</span><span>Spatiotemporal ML</span><span>Surveillance</span></div></div></section>
      <section className="explore-right"><div className="right-head"><div><SectionLabel>RELATED PAPERS</SectionLabel><h3>Sorted by similarity</h3></div><div className="filters"><div className="filter-chips">{['All','Conference','Journal'].map(f=><button className={filter===f?'selected':''} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div><select value={year} onChange={e=>setYear(e.target.value)}><option>All</option><option>2025</option><option>2024</option><option>2023</option></select></div></div><div className="paper-list">{visible.map(p=><article className="paper-card" key={p.title}><div className="paper-icon"><BookOpen size={17}/></div><div className="paper-main"><div className="paper-title-row"><h3>{p.title}</h3><span className="similarity-badge">{p.similarity}%</span></div><p>{p.publisher} · {p.year} · Published {p.date}</p><div className="paper-meta"><span className={`type-badge ${p.type.toLowerCase()}`}>{p.type} paper</span><a href="#" onClick={e=>e.preventDefault()}><ExternalLink size={13}/> Source · {p.source}</a></div></div></article>)}</div><button className="primary-btn wide-next" onClick={()=>onNavigate('gaps')}>Next: Find research gaps <ArrowRight size={17}/></button></section></div>
  </>;
}

function Gaps({selectedGaps,setSelectedGaps,onNavigate,notify}) {
  const [drawer,setDrawer]=useState(null); const [uploaded,setUploaded]=useState(false);
  const toggleGap=(gap)=>setSelectedGaps(prev=>prev.some(g=>g.title===gap.title)?prev.filter(g=>g.title!==gap.title):[...prev,gap]);
  return <><PageTitle eyebrow="STEP 2 · RESEARCH GAPS" title="Research gaps" description="Find evidence-backed limitations, inspect their sources, and select one or more gaps you want to solve."/>
    <StepGuide current={selectedGaps.length?2:1} steps={['Upload a paper or select papers from Explore.','Click Find research gaps and wait for analysis.','Read each gap and check its source paper and section.','Select one or more gaps, then move to the Experiment plan.']}/>
    <section className="upload-panel panel"><div className="upload-zone" onClick={()=>setUploaded(true)}><UploadCloud size={24}/><strong>{uploaded?'Paper ready for analysis':'Upload PDF / DOCX'}</strong><span>{uploaded?'road-accident-paper.pdf selected':'Drag & drop or click to browse'}</span></div><div className="upload-actions"><span>{uploaded?<><CheckCircle2 size={15}/> 1 paper selected</>:<>Or select papers directly from <button className="text-btn">Explore</button></>}</span><button className="primary-btn" onClick={()=>notify('Gap analysis started — mock results are ready.')}>Find research gaps <ArrowRight size={16}/></button></div></section>
    <Stats/><div className="section-heading"><div><SectionLabel>IDENTIFIED GAPS</SectionLabel><h3>Evidence-backed research gaps</h3></div><span className="result-count">{selectedGaps.length} selected · {gaps.length} found</span></div>
    <div className="selection-banner"><div><strong>{selectedGaps.length} research gap{selectedGaps.length===1?'':'s'} selected</strong><span>You can combine multiple gaps into one experiment plan.</span></div><button className="text-btn" onClick={()=>setSelectedGaps([])} disabled={!selectedGaps.length}>Clear selection</button></div>
    <div className="gap-list">{gaps.map((g,i)=>{const isSelected=selectedGaps.some(x=>x.title===g.title);return <article className={`gap-card ${isSelected?'selected':''}`} key={g.title}><div className="gap-top"><div><span className={`evidence ${g.tone}`}>{g.evidence}</span><h3>{g.title}</h3></div><button className={`gap-select ${isSelected?'chosen':''}`} onClick={()=>toggleGap(g)}>{isSelected?<><Check size={14}/> Selected</>:<>Select gap</>}</button></div><div className="gap-lines"><p><strong>What the paper has done:</strong> {g.done}</p><p><strong>What can be done now for improvement:</strong> {g.improve}</p></div><div className="gap-source"><a href="#" onClick={e=>e.preventDefault()}><ExternalLink size={13}/> {g.source}</a><button className="secondary-btn" onClick={()=>setDrawer(g)}>View sources</button></div></article>})}</div>
    <div className="sticky-action"><div><strong>{selectedGaps.length?`${selectedGaps.length} gap${selectedGaps.length===1?'':'s'} ready`:'Select at least one gap'}</strong><span>Selected gaps will be carried into the Experiment plan.</span></div><div><button className="secondary-btn" onClick={()=>onNavigate('experiment')}>Next: Experiment plan <ArrowRight size={15}/></button><button className="primary-btn" disabled={!selectedGaps.length} onClick={()=>onNavigate('experiment')}>Move to Experiment plan <ArrowRight size={15}/></button></div></div>
    {drawer&&<div className="drawer-overlay" onClick={()=>setDrawer(null)}><aside className="source-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-head"><div><SectionLabel>SOURCE EVIDENCE</SectionLabel><h3>Exact supporting excerpts</h3></div><button className="icon-button" onClick={()=>setDrawer(null)}><X size={18}/></button></div><div className="drawer-gap"><span className={`evidence ${drawer.tone}`}>{drawer.evidence}</span><h4>{drawer.title}</h4><p>{drawer.source}</p></div>{drawer.quotes.map((q,i)=><blockquote key={i}>“{q}”<small>Source excerpt · {drawer.source}</small></blockquote>)}<button className="primary-btn full" onClick={()=>setDrawer(null)}>Done reviewing sources</button></aside></div>}
  </>;
}

function Experiment({selectedGaps,onNavigate,notify}) {
  const [checked,setChecked]=useState({}); const toggle=k=>setChecked(x=>({...x,[k]:!x[k]}));
  const gapList=selectedGaps.length?selectedGaps:[gaps[0]];
  const datasetItems=datasets.map(([name,meta])=>({name,meta,cite:'Dataset source'})); const baselineItems=baselines.map(([name,meta,has])=>({name,meta:meta+(has?' · has code':' · reference only'),cite:'Baseline paper'})); const metricItems=metrics.map(m=>({name:m,meta:'Recommended evaluation metric',cite:'Evaluation guide'}));
  return <><PageTitle eyebrow="STEP 3 · EXPERIMENT PLAN" title="Experiment plan" description="Turn your selected research gaps into a practical, source-linked experiment plan." action={<button className="secondary-btn" onClick={()=>notify('Experiment plan exported as PDF (demo).')}><Download size={15}/> Export as PDF</button>}/><StepGuide current={2} steps={['Review the connected research gaps.','Check the AI insight for how the gaps can be addressed.','Select datasets, baselines and evaluation metrics.','Continue to Novelty check after reviewing the plan.']}/><section className="panel connected-gap"><div><SectionLabel>CONNECTED RESEARCH GAPS</SectionLabel><h3>{selectedGaps.length} selected gap{selectedGaps.length===1?'':'s'}</h3>{gapList.map(g=><div className="connected-gap-item" key={g.title}><CheckCircle2 size={15}/><span>{g.title}</span></div>)}</div><button className="text-btn" onClick={()=>onNavigate('gaps')}>Change gaps</button></section><section className="insight-card"><div className="insight-icon"><Sparkles size={18}/></div><div><SectionLabel>AI INSIGHT</SectionLabel><div className="insight-grid"><p><strong>Which resources can cover this gap</strong><span>Use diverse CCTV/video datasets and comparable public benchmarks.</span></p><p><strong>Which gap can be solved</strong><span>Prioritize low-resolution, night-time and cross-dataset robustness.</span></p><p><strong>How the results can improve</strong><span>Report robustness metrics and compare against established baselines.</span></p></div></div></section><div className="experiment-grid"><ChecklistPanel title="Dataset" icon={Database} items={datasetItems} checked={checked} toggle={toggle}/><ChecklistPanel title="Baselines" icon={GitIcon} items={baselineItems} checked={checked} toggle={toggle}/><ChecklistPanel title="Evaluation metrics" icon={Target} items={metricItems} checked={checked} toggle={toggle}/></div><div className="bottom-action"><span><ShieldCheck size={16}/> Each selected item includes a source reference.</span><button className="primary-btn" onClick={()=>onNavigate('novelty')}>Continue to Novelty check <ArrowRight size={16}/></button></div></>;
}

function GitIcon(){return <GitBranch size={18}/>}
function ChecklistPanel({title,icon:Icon,items,checked,toggle}) { return <section className="panel checklist-panel"><div className="panel-head"><div className="title-icon"><Icon/><h3>{title}</h3></div><span>{items.length} options</span></div>{items.map((it,i)=>{const key=`${title}-${i}`;return <label className="check-row" key={key}><input type="checkbox" checked={!!checked[key]} onChange={()=>toggle(key)}/><span className="custom-check">{checked[key]&&<Check size={12}/>}</span><div className="check-main"><strong>{it.name}</strong><small>{it.meta}</small><span className="citation-chip"><BookOpen size={10}/>{it.cite}</span></div></label>})}</section>; }

function Novelty({onNavigate}) {
  const [score,setScore]=useState(72); const [ps,setPs]=useState('How can deep learning detect road accidents reliably from real-world CCTV footage?'); const [checked,setChecked]=useState(false);
  const verdict=score<40?'Low novelty':score<=80?'Medium novelty':'High novelty'; const tone=score<40?'low':score<=80?'medium':'high';
  return <>
    <PageTitle eyebrow="STEP 4 · NOVELTY CHECK" title="Novelty check" description="Compare your research problem with the closest retrieved papers before drafting your work."/>
    <StepGuide current={0} steps={['Enter or confirm your final problem statement.','Run the novelty comparison against retrieved papers.','Review the closest papers and similarity evidence.','Use the result to refine your idea before drafting.']}/>
    <section className="novelty-input panel"><label>Your problem statement (PS)</label><div><textarea value={ps} onChange={e=>setPs(e.target.value)}/><button className="primary-btn" onClick={()=>setChecked(true)}>{checked?<><Check size={16}/> Re-check novelty</>:<>Check novelty <Target size={16}/></>}</button></div><span>The AI will evaluate the novelty of your PS.</span></section>
    <div className={`score-card ${tone}`}><div className="score-ring"><div><strong>{score}/100</strong><span>NOVELTY SCORE</span></div></div><div className="score-verdict"><span>Current assessment</span><h3>{verdict}</h3><p>{checked?'Calculated from semantic similarity with the closest retrieved papers.':'Run the check to evaluate this problem statement.'}</p></div></div>
    <div className="legend-card panel"><div><SectionLabel>SCORE LEGEND</SectionLabel><h3>How to read the score</h3></div><div className="legend-items"><span className="low"><i/>Below 40 · Low novelty</span><span className="medium"><i/>40 to 80 · Medium novelty</span><span className="high"><i/>Above 80 · High novelty</span></div></div>
    <section><div className="section-heading"><div><SectionLabel>CLOSEST PAPERS</SectionLabel><h3>Similarity evidence</h3></div><span className="result-count">4 papers</span></div><div className="table-wrap"><table><thead><tr><th>Paper name</th><th>Publisher</th><th>Year</th><th>Similarity %</th><th>Source</th></tr></thead><tbody>{papers.map(p=><tr key={p.title}><td><strong>{p.title}</strong></td><td>{p.publisher}</td><td>{p.year}</td><td><div className="table-sim"><span><i style={{width:`${p.similarity}%`}}/></span><b>{p.similarity}%</b></div></td><td><a href="#" onClick={e=>e.preventDefault()}><ExternalLink size={12}/> Source</a></td></tr>)}</tbody></table></div></section>
    <div className="bottom-action"><span><ShieldCheck size={16}/> Similarity is evidence, not a guarantee that an idea is unpublished.</span><button className="primary-btn" onClick={()=>onNavigate('writer')}>Next: Draft paper <ArrowRight size={16}/></button></div>
  </>;
}

function Writer({notify}) { const [tab,setTab]=useState('Abstract'); const [text,setText]=useState('This study investigates robust road accident detection from real-world CCTV footage, focusing on low-resolution and challenging surveillance conditions.'); const tabs=['Abstract','Literature Review','Methodology','References']; return <><PageTitle eyebrow="STEP 5 · DRAFT PAPER" title="Draft paper" description="Draft research sections with source-aware citations and keep the final academic judgment with the student." action={<button className="primary-btn" onClick={()=>notify('Draft exported as Word document (demo).')}><Download size={15}/> Export Word</button>}/><StepGuide current={0} steps={['Choose the section you want to draft.','Review the suggested text and linked citations.','Edit the draft using your own verified interpretation.','Verify every citation before final submission.']}/><div className="writer-layout"><section className="editor-panel"><div className="editor-tabs">{tabs.map(t=><button className={tab===t?'active':''} onClick={()=>setTab(t)} key={t}>{t}</button>)}</div><div className="editor-toolbar"><span>{tab} · autosave on</span><div><button>B</button><button><Paperclip size={13}/></button></div></div><textarea value={text} onChange={e=>setText(e.target.value)}/><div className="editor-footer"><span><CheckCircle2 size={13}/> Draft saved</span><span>{text.length} characters</span></div></section><aside className="citation-panel"><div className="panel-head"><div><SectionLabel>CITATIONS</SectionLabel><h3>Source panel</h3></div><span className="verified-count"><ShieldCheck size={12}/> 4 verified</span></div>{papers.slice(0,4).map((p,i)=><div className="citation" key={p.title}><span>[{i+1}]</span><div><strong>{p.title}</strong><small>{p.publisher} · {p.year}<br/>Source verified</small></div><CheckCircle2 size={14}/></div>)}<div className="citation-note"><ShieldCheck size={15}/><span>Paper Writer produces a draft. Verify and rewrite the final paper yourself.</span></div></aside></div></>; }

function Mentors({mentor,setMentor,booking,setBooking,notify}) { const [expertise,setExpertise]=useState('All'); const [slot,setSlot]=useState(null); const [confirmed,setConfirmed]=useState(false); const filtered=mentors.filter(m=>expertise==='All'||m.expertise.includes(expertise)); const openBooking=m=>{setMentor(m);setSlot(null);setConfirmed(false);}; return <><PageTitle eyebrow="MENTOR SUPPORT" title="My mentors" description="Find a verified research mentor for gap, experiment-plan or draft review." action={<button className="secondary-btn"><CalendarDays size={15}/> Upcoming sessions</button>}/><div className="mentor-toolbar"><div className="search-box"><Search size={16}/><input placeholder="Search mentors or expertise..."/></div><div className="filter-chips">{['All','Computer Vision','Deep Learning','NLP','Research Design'].map(f=><button className={expertise===f?'selected':''} onClick={()=>setExpertise(f)} key={f}>{f}</button>)}</div></div><div className="mentor-grid">{filtered.map(m=><article className="mentor-card" key={m.name}><div className="mentor-avatar">{m.initials}</div><span className="verified"><ShieldCheck size={11}/> Verified</span><h3>{m.name}</h3><p>{m.role}</p><div className="rating"><Star size={13} fill="currentColor"/> {m.rating} <span>· {m.price}</span></div><div className="mentor-tags">{m.expertise.map(e=><span key={e}>{e}</span>)}</div><div className="mentor-actions"><button className="secondary-btn" onClick={()=>openBooking(m)}>View slots</button><button className="text-btn">Pricing</button></div></article>)}</div><div className="mentor-review panel"><div><SectionLabel>REQUEST REVIEW</SectionLabel><h3>Need feedback on your research?</h3><p>Request a mentor review for your selected gap, experiment plan or paper draft.</p></div><div><button className="secondary-btn" onClick={()=>notify('Gap review request created (demo).')}>Gap review</button><button className="secondary-btn" onClick={()=>notify('Plan review request created (demo).')}>Plan review</button><button className="primary-btn" onClick={()=>notify('Draft review request created (demo).')}>Draft review</button></div></div><section className="upcoming panel"><div><SectionLabel>UPCOMING SESSIONS</SectionLabel><h3>{confirmed?'Your confirmed session':'No confirmed sessions yet'}</h3></div>{confirmed&&<div className="upcoming-session"><div className="date-tile"><strong>12</strong><span>OCT</span></div><div><strong>{mentor.name}</strong><span>Research review · {slot}</span></div><CheckCircle2 size={18}/></div>}</section>{mentor&&!confirmed&&<div className="modal-overlay"><div className="booking-modal"><div className="modal-head"><div><SectionLabel>STEP 2 · CHOOSE SLOT</SectionLabel><h3>{mentor.name}</h3><p>{mentor.price}</p></div><button className="icon-button" onClick={()=>setMentor(null)}><X size={18}/></button></div><div className="calendar-row"><div className="calendar-box"><CalendarDays size={17}/><strong>Saturday, 12 October</strong><span>Select a date</span></div><div className="slot-grid">{['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','05:00 PM'].map(s=><button className={slot===s?'selected':''} onClick={()=>setSlot(s)} key={s}>{s}</button>)}</div></div><button className="primary-btn full" disabled={!slot} onClick={()=>setBooking({mentor,slot})}>Book selected slot <ArrowRight size={15}/></button></div></div>}{booking&&!confirmed&&<div className="modal-overlay"><div className="booking-modal"><div className="modal-head"><div><SectionLabel>STEP 3 · BOOKING FORM</SectionLabel><h3>Confirm your session</h3></div><button className="icon-button" onClick={()=>setBooking(null)}><X size={18}/></button></div><div className="booking-summary"><strong>{booking.mentor.name}</strong><span>{booking.mentor.role}</span><span>{booking.slot} · 1 hour · {booking.mentor.price}</span></div><div className="form-grid"><input placeholder="Name" defaultValue="Amartya"/><input placeholder="Email"/><input placeholder="Contact number"/><input value={booking.slot} readOnly/></div><button className="primary-btn full" onClick={()=>{setConfirmed(true);setBooking(null);setMentor(null);notify('Booking confirmed.')}}>Confirm booking <Check size={15}/></button></div></div>}{confirmed&&<div className="confirmation panel"><CheckCircle2 size={34}/><div><h3>Booking confirmed.</h3><p>You'll get an SMS reminder 2 hours before your session.</p></div></div>}</>; }

function Projects({onNavigate}) { const projects=[['Road Accident Detection',45,'Experiment plan','Computer Vision'],['AI in Education',60,'Research gaps','Machine Learning'],['Fake News Detection',20,'Explore','NLP']]; return <><PageTitle eyebrow="WORKSPACE" title="My projects" description="Return to any research project and continue from its current step." /><StepGuide current={0} steps={['Choose a project you want to continue.','Open the current workflow step.','Review previous evidence before continuing.','Keep each research decision linked to its sources.']}/><div className="project-grid">{projects.map(([name,progress,step,domain])=><article className="project-card project-large" key={name}><div className="project-card-top"><div className="project-icon"><FolderKanban size={17}/></div><span className="project-domain">{domain}</span></div><h3>{name}</h3><span>Current step: {step}</span><div className="progress-track"><i style={{width:`${progress}%`}}/></div><div className="project-bottom"><strong>{progress}% complete</strong><button className="primary-btn" onClick={()=>onNavigate(step==='Explore'?'explore':step==='Research gaps'?'gaps':step==='Experiment plan'?'experiment':'novelty')}>Continue <ArrowRight size={15}/></button></div></article>)}</div><Stats/></>; }


function HelpGuide({onNavigate}) {
  const sections=[['1','Start with Explore','Enter a clear problem statement. Refine it, read the generated topic context, then inspect related papers before moving forward.'],['2','Find research gaps','Upload a paper or use papers from Explore. Read each evidence-backed gap and open its source excerpts before selecting one or more gaps.'],['3','Build the experiment plan','Review the connected gaps, then choose datasets, baselines and evaluation metrics. Keep every choice linked to a source.'],['4','Check novelty','Submit your problem statement and compare similarity evidence with the closest papers. A score is an aid for investigation, not proof of novelty.'],['5','Draft the paper','Draft section by section, inspect citations, edit the generated text, and verify every reference before academic use.'],['6','Use mentors when needed','Book a mentor for gap review, experiment-plan review or draft review. Prepare your selected evidence before the session.']];
  return <><PageTitle eyebrow="HELP CENTER" title="Help & guide" description="A step-by-step guide for completing your research project without skipping important evidence checks."/><section className="help-hero"><div><span className="hero-badge"><CircleHelp size={14}/> RESEARCH WORKFLOW GUIDE</span><h2>Follow the workflow in order</h2><p>Explore → Research gaps → Experiment plan → Novelty check → Draft paper. My Mentors and My Projects are available throughout the workflow.</p></div><div className="help-visual"><Sparkles size={42}/><span>Research decisions stay connected to sources.</span></div></section><div className="help-grid">{sections.map(([n,t,d])=><article className="help-card" key={n}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div></article>)}</div><section className="help-faq panel"><SectionLabel>QUICK ANSWERS</SectionLabel><div className="faq-grid"><div><strong>Can I select multiple gaps?</strong><p>Yes. Select as many relevant gaps as your experiment can reasonably address. All selected gaps are carried into the Experiment plan.</p></div><div><strong>What should I verify?</strong><p>Check the paper, section, quoted evidence, dataset licence, baseline reference and final citations before making academic claims.</p></div><div><strong>What if the novelty score is medium?</strong><p>Inspect the closest papers and identify the exact difference in dataset, method, setting or evaluation rather than treating the score as a final decision.</p></div><div><strong>Where do I continue?</strong><p>Use the pipeline tracker or Continue button on the current page. Your selected gaps and project progress remain available in the workspace.</p></div></div></section></>;
}
function LandingPage({onLogin,onSignup}) {
  const [menu,setMenu]=useState(false); return <div className="landing-page"><div className="landing-orb orb-one"/><div className="landing-orb orb-two"/><div className="landing-grid"/><nav className="landing-nav"><a className="landing-brand" href="#home"><span><Sparkles size={18}/></span> Research Mentor <small>AI</small></a><div className={`landing-links ${menu?'show':''}`}><a href="#home">Home</a><a href="#about">About us</a><a href="#workflow">How it works</a><a href="#plans">Plans</a><a href="#mentors">Mentors</a></div><div className="landing-actions"><button className="landing-login" onClick={onLogin}>Log in</button><button className="landing-signup" onClick={onSignup}>Sign up <ArrowRight size={15}/></button><button className="landing-menu" onClick={()=>setMenu(!menu)}><Menu size={20}/></button></div></nav>
    <main><section className="landing-hero" id="home"><div className="hero-copy"><div className="eyebrow-pill"><span/> AI-powered research workspace</div><h1>From a <em>research idea</em><br/>to a plan you can defend.</h1><p>Research Mentor AI helps students discover papers, identify research gaps, design experiments, check novelty and draft a source-aware research paper — in one guided workflow.</p><div className="hero-cta"><button className="landing-primary" onClick={onSignup}>Start your research journey <ArrowRight size={17}/></button><button className="landing-secondary" onClick={onLogin}>I already have an account</button></div><div className="hero-proof"><span><ShieldCheck size={15}/> Source-linked outputs</span><span><GitBranch size={15}/> Multi-agent workflow</span><span><GraduationCap size={15}/> Built for students</span></div></div><div className="hero-dashboard"><div className="floating-tag tag-one"><CheckCircle2 size={14}/> 96% citations verified</div><div className="floating-tag tag-two"><Sparkles size={14}/> Novelty 72/100</div><div className="mock-window"><div className="mock-top"><span/><span/><span/><b>Research Mentor AI</b></div><div className="mock-content"><div className="mock-side"><i/><i/><i/><i/><i/></div><div className="mock-main"><div className="mock-kicker">RESEARCH WORKFLOW</div><h3>Road Accident Detection</h3><div className="mock-pipeline"><span className="active">Explore</span><span className="active">Gaps</span><span>Experiment</span><span>Novelty</span><span>Draft</span></div><div className="mock-cards"><div><small>RESEARCH GAPS</small><strong>3 evidence-backed gaps</strong><i style={{width:'76%'}}/></div><div><small>NOVELTY CHECK</small><strong>72 / 100</strong><i style={{width:'58%'}}/></div><div><small>EXPERIMENT PLAN</small><strong>8 items selected</strong><i style={{width:'84%'}}/></div></div></div></div></div></div></section><section className="landing-stats"><div><strong>5</strong><span>guided workflow stages</span></div><div><strong>6</strong><span>specialized AI agents</span></div><div><strong>3+</strong><span>research data sources</span></div><div><strong>1</strong><span>shared project workspace</span></div></section><section className="landing-section" id="about"><div className="section-intro"><span>WHY RESEARCH MENTOR AI</span><h2>Research should feel like a guided process, not a maze of tabs.</h2><p>Move from literature discovery to a defensible experiment plan while keeping important decisions connected to evidence.</p></div><div className="feature-grid"><article><Search size={22}/><h3>Discover</h3><p>Find relevant papers, datasets and research context around your problem statement.</p></article><article><Lightbulb size={22}/><h3>Understand gaps</h3><p>Compare limitations and future-work signals across the papers you selected.</p></article><article><FlaskConical size={22}/><h3>Design experiments</h3><p>Turn selected gaps into datasets, baselines and measurable evaluation steps.</p></article><article><FileText size={22}/><h3>Draft with sources</h3><p>Build your paper section by section and inspect the citations behind the draft.</p></article></div></section><section className="landing-section workflow-section" id="workflow"><div className="section-intro center"><span>HOW IT WORKS</span><h2>A clear path from question to research draft.</h2></div><div className="workflow-line">{pipeline.map((p,i)=><div key={p.id}><b>{String(i+1).padStart(2,'0')}</b><span>{p.label}</span><small>{['Discover related research','Select evidence-backed gaps','Build the experiment','Compare similar work','Draft and verify'][i]}</small></div>)}</div></section><section className="plans-section" id="plans"><div className="section-intro center"><span>SIMPLE PLANS</span><h2>Start free. Add support when you need it.</h2></div><div className="plans-grid"><article><small>STUDENT</small><h3>Free</h3><strong>₹0</strong><p>Explore papers, save projects and try the core research workflow.</p><button onClick={onSignup}>Create account</button></article><article className="featured-plan"><div className="plan-badge">POPULAR</div><small>RESEARCHER</small><h3>Student Plus</h3><strong>₹299<span>/mo</span></strong><p>Full workflow, richer project workspace and export-ready research planning.</p><button onClick={onSignup}>Get started</button></article><article><small>MENTOR</small><h3>Review</h3><strong>Pay per session</strong><p>Book verified mentors for gap, experiment-plan or draft feedback.</p><button onClick={onSignup}>Explore mentors</button></article></div></section><section className="landing-cta" id="mentors"><div><span>READY TO RESEARCH?</span><h2>Bring your next idea into focus.</h2><p>Create your workspace and follow the workflow one step at a time.</p></div><button onClick={onSignup}>Create your free account <ArrowRight size={17}/></button></section></main><footer className="landing-footer"><div>© 2026 Research Mentor AI</div><div><a href="#about">About</a><a href="#plans">Plans</a><a href="#workflow">How it works</a><button onClick={onLogin}>Log in</button></div></footer></div>;
}
function LoginPage({onLogin,onSignup,onBack}) { const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); return <AuthShell onBack={onBack} mode="login"><form className="auth-card" onSubmit={e=>{e.preventDefault();onLogin()}}><div className="auth-icon"><Sparkles size={20}/></div><span className="auth-kicker">WELCOME BACK</span><h1>Log in to your research workspace</h1><p>Continue your research workflow from where you left off.</p><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" required/></label><div className="auth-row"><label className="check-inline"><input type="checkbox"/> Remember me</label><button type="button" className="text-btn">Forgot password?</button></div><button className="landing-primary auth-submit" type="submit">Log in <ArrowRight size={16}/></button><div className="auth-divider"><span>or</span></div><button type="button" className="auth-google">Continue with Google</button><p className="auth-switch">New to Research Mentor? <button type="button" onClick={onSignup}>Create an account</button></p></form></AuthShell>; }
function SignupPage({onSignup,onLogin}) { const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); return <AuthShell mode="signup"><form className="auth-card" onSubmit={e=>{e.preventDefault();onSignup()}}><div className="auth-icon"><GraduationCap size={20}/></div><span className="auth-kicker">CREATE YOUR WORKSPACE</span><h1>Build your research journey</h1><p>Set up your student account and start with a problem statement.</p><label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/></label><label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" required/></label><button className="landing-primary auth-submit" type="submit">Create account <ArrowRight size={16}/></button><p className="auth-switch">Already have an account? <button type="button" onClick={onLogin}>Log in</button></p></form></AuthShell>; }
function AuthShell({children,mode,onBack}) { return <div className="auth-page"><div className="auth-bg-orb one"/><div className="auth-bg-orb two"/><button className="auth-back" onClick={onBack||(()=>window.history.back())}><ArrowRight size={16} style={{transform:'rotate(180deg)'}}/> Back to website</button><div className="auth-brand"><span><Sparkles size={18}/></span> Research Mentor <small>AI</small></div><div className="auth-layout"><div className="auth-promo"><span className="eyebrow-pill"><span/> {mode==='signup'?'YOUR RESEARCH WORKSPACE':'WELCOME BACK'}</span><h2>Research smarter.<br/><em>Build with evidence.</em></h2><p>Discover papers, identify gaps, design experiments and draft your research — one step at a time.</p><div className="auth-flow"><span>Explore</span><i/><span>Gaps</span><i/><span>Experiment</span><i/><span>Novelty</span><i/><span>Draft</span></div></div>{children}</div></div>; }

createRoot(document.getElementById('root')).render(<App/>);
