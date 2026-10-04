import React, { useEffect, useState } from 'react';
import { CheckCircle2, CircleHelp, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import { navItems } from './data/nav';
import { Dashboard } from './features/Dashboard';
import { Explore } from './features/Explore';
import { Gaps } from './features/Gaps';
import { Experiment } from './features/Experiment';
import { Novelty } from './features/Novelty';
import { Writer } from './features/Writer';
import { Mentors } from './features/Mentors';
import { HelpGuide } from './features/Help';
import { LandingPage } from './pages/Landing';
import { api, getToken, setToken } from './api/client';
import { initials } from './components/ui';
import { LoginPage, SignupPage } from './pages/Auth';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [publicPage, setPublicPage] = useState('home');
  const [active, setActive] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedGaps, setSelectedGaps] = useState([]);
  const [gapResult, setGapResult] = useState(null);
  const [booting, setBooting] = useState(!!getToken());
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [gapFile, setGapFile] = useState(null);
  const [seedPs, setSeedPs] = useState('');
  const [toast, setToast] = useState('');
  const notify = (m) => { setToast(m); window.clearTimeout(window.__rmToast); window.__rmToast = window.setTimeout(() => setToast(''), 2600); };
  const enter = async (call) => { setAuthBusy(true); setAuthError(''); try { const { token, user: u } = await call(); setToken(token); setUser(u); setAuthenticated(true); setActive('dashboard'); } catch (e) { setAuthError(e.message); } finally { setAuthBusy(false); } };
  const login = (email, password) => enter(() => api.auth.login(email, password));
  const signup = (name, email, password) => enter(() => api.auth.signup(name, email, password));
  useEffect(() => {
    if (getToken()) api.auth.me().then(r => { setUser(r.user); setAuthenticated(true); }).catch(() => setToken(null)).finally(() => setBooting(false));
    const out = () => { setAuthenticated(false); setUser(null); setPublicPage('home'); };
    window.addEventListener('rm-logout', out);
    return () => window.removeEventListener('rm-logout', out);
  }, []);
  const logout = () => { setToken(null); setUser(null); setAuthenticated(false); setPublicPage('home'); setGapResult(null); setSelectedGaps([]); };
  const navigate = (id) => { setActive(id); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const start = (text) => { setSeedPs(text); navigate('explore'); };

  if (booting) return <div className="boot">Loading…</div>;
  if (!authenticated) {
    if (publicPage === 'home') return <LandingPage onLogin={() => { setPublicPage('auth'); setAuthView('login'); }} onSignup={() => { setPublicPage('auth'); setAuthView('signup'); }} />;
    if (authView === 'login') return <LoginPage error={authError} busy={authBusy} onLogin={login} onSignup={() => setAuthView('signup')} onBack={() => { setAuthView('login'); setPublicPage('home'); }} />;
    return <SignupPage error={authError} busy={authBusy} onSignup={signup} onLogin={() => setAuthView('login')} />;
  }
  const label = active === 'help' ? 'Help & guide' : (navItems.find(n => n.id === active) || {}).label;
  return <div className="app-shell">
    <Sidebar user={user} active={active} onNavigate={navigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onLogout={logout} />
    <main className="main-shell">
      <header className="topbar">
        <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <div className="crumbs"><span>Research Mentor</span><span>/</span><strong>{label}</strong></div>
        <div className="top-actions"><button className="icon-button" onClick={() => navigate('help')} aria-label="Help"><CircleHelp size={19} /></button><span className="avatar" title={user.name}>{initials(user.name)}</span></div>
      </header>
      <div className="content">
        {active === 'dashboard' && <Dashboard user={user} onNavigate={navigate} onStart={start} />}
        {active === 'explore' && <Explore key={seedPs} initialPs={seedPs} />}
        {active === 'gaps' && <Gaps selectedGaps={selectedGaps} setSelectedGaps={setSelectedGaps} result={gapResult} setResult={setGapResult} file={gapFile} setFile={setGapFile} onNavigate={navigate} notify={notify} />}
        {active === 'experiment' && <Experiment selectedGaps={selectedGaps} onNavigate={navigate} notify={notify} />}
        {active === 'novelty' && <Novelty />}
        {active === 'writer' && <Writer notify={notify} />}
        {active === 'mentors' && <Mentors user={user} notify={notify} />}
        {active === 'help' && <HelpGuide onNavigate={navigate} />}
      </div>
    </main>
    {toast && <div className="toast"><CheckCircle2 size={16} />{toast}</div>}
  </div>;
}
