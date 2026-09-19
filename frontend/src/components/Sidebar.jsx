import { Flower2, LayoutGrid, Download, Upload } from 'lucide-react';

export default function Sidebar({ onHome, onExport, onImport }) {
  return <aside className="sidebar">
    <button className="brand" onClick={onHome} aria-label="Bloom home">
      <span className="brand-mark"><Flower2 />
      </span>bloom<span className="brand-dot">.</span></button>

    <span className="sidebar-caption">A LITTLE TODAY. A LOT SOMEDAY.</span>

    <nav aria-label="Main navigation"><button className="nav-link active" onClick={onHome}>
      <LayoutGrid size={19} /><span>My goals</span></button></nav>

    <div className="sidebar-bottom">
      <button className="nav-link" onClick={onExport}>
        <Download size={17} /><span>Export backup</span></button>
          </div>
  </aside>;
}
