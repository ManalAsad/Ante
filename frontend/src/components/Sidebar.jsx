import { Flower2, LayoutGrid, Route, Trophy, Download } from 'lucide-react';

export default function Sidebar({ view, onHome, onJourney, onCompleted, onExport }) {
  const link = (target, Icon, label, onClick) => {
    const active = target === 'home' ? view !== 'journey' && view !== 'completed' : view === target;
    return <button className={`nav-link ${active ? 'active' : ''}`}
      aria-current={active ? 'page' : undefined} onClick={onClick}>
      <Icon size={19} /><span>{label}</span>
    </button>;
  };

  return <aside className="sidebar">
    <button className="brand" onClick={onHome} aria-label="Bloom home">
      <span className="brand-mark"><Flower2 />
      </span>bloom<span className="brand-dot">.</span></button>

    <span className="sidebar-caption">A LITTLE TODAY. A LOT SOMEDAY.</span>

    <nav aria-label="Main navigation">
      {link('home', LayoutGrid, 'My goals', onHome)}
      {link('journey', Route, 'My journey', onJourney)}
      {link('completed', Trophy, 'Completed', onCompleted)}
    </nav>

    <div className="sidebar-bottom">
      <button className="nav-link" onClick={onExport}>
        <Download size={17} /><span>Export backup</span></button>
          </div>
  </aside>;
}
