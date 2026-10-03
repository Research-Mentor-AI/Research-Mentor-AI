import React, { useEffect, useRef, useState } from 'react';
import { CircleHelp, FolderOpen, LogOut, MoreHorizontal, Sparkles, X } from 'lucide-react';
import { initials } from './ui';
import { navItems } from '../data/nav';

export default function Sidebar({ user, active, onNavigate, mobileOpen, onClose, onLogout }) {
  const [menu, setMenu] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const away = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);
  const go = (id) => { setMenu(false); onNavigate(id); };
  return <>
    {mobileOpen && <div className="overlay" onClick={onClose} />}
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Sparkles size={19} /></div>
        <div><div className="brand-title">Research Mentor</div><div className="brand-sub">AI research workspace</div></div>
        <button type="button" className="icon-button sidebar-close" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
      </div>
      <div className="nav-label">Workspace</div>
      <nav aria-label="Main">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} className={`nav-item ${active === id ? 'active' : ''}`} aria-current={active === id ? 'page' : undefined} onClick={() => go(id)}>
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom" ref={ref}>
        <button type="button" className={`nav-item ${active === 'help' ? 'active' : ''}`} onClick={() => go('help')}><CircleHelp size={18} /><span>Help & guide</span></button>
        <button type="button" className="profile-btn" onClick={() => setMenu(m => !m)} aria-expanded={menu}>
          <span className="avatar small">{initials(user.name)}</span>
          <span className="profile-name"><strong>{user.name}</strong><small>{user.email || 'Student workspace'}</small></span>
          <MoreHorizontal size={18} />
        </button>
        {menu && <div className="profile-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => go('help')}><FolderOpen size={16} /> Help & guide</button>
          <button type="button" role="menuitem" className="danger" onClick={() => { setMenu(false); onLogout(); }}><LogOut size={16} /> Log out</button>
        </div>}
      </div>
    </aside>
  </>;
}
