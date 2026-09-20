import { LayoutGrid, Route, Sparkles, Trophy, Download, LogOut } from 'lucide-react';
import AnteMark from './AnteMark.jsx';

const PAGES = ['journey', 'bloomed', 'completed'];

export default function Sidebar({ view, onHome, onJourney, onBloomed, onCompleted,
  onExport, user, onSignOut }) {
  const link = (target, Icon, label, onClick) => {
    const active = target === 'home' ? !PAGES.includes(view) : view === target;
    return <button className={`nav-link ${active ? 'active' : ''}`}
      aria-current={active ? 'page' : undefined} onClick={onClick}>
      <Icon size={19} /><span>{label}</span>
    </button>;
  };

  return <aside className="sidebar">
    <button className="brand" onClick={onHome} aria-label="Ante home">
      <span className="brand-mark"><AnteMark size={29} />
      </span>Ante<span className="brand-dot">.</span></button>

    <span className="sidebar-caption">YOUR MOVE.</span>

    <nav aria-label="Main navigation">
      {link('home', LayoutGrid, 'My goals', onHome)}
      {link('journey', Route, 'My journey', onJourney)}
      {link('bloomed', Sparkles, 'Completed journeys', onBloomed)}
      {link('completed', Trophy, 'Completed goals', onCompleted)}
    </nav>

    <div className="sidebar-bottom">
      <button className="nav-link" onClick={onExport}>
        <Download size={17} /><span>Export CSV</span></button>

      <div className="sidebar-user">
        {user?.email && <span title={user.email}>{user.email}</span>}
        <button className="nav-link" onClick={onSignOut}>
          <LogOut size={17} /><span>Log out</span></button>
      </div>
    </div>
  </aside>;
}
