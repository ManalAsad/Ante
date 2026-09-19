import {useEffect, useId, useRef} from 'react';
import {X } from 'lucide-react';

export default function Modal({title, subtitle, children, onClose, wide = false }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement;
    element.showModal();
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = priorOverflow; previous?.focus(); };
  }, []);

  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === dialog.current) onClose(); }} className={`modal ${wide ? 'modal-wide' : ''}`}>

    <div className="modal-inner">
      <header className="modal-heading">
        <div>
          <h2 id={titleId}>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" onClick={onClose} className="icon-button" aria-label="Close dialog"><X size={20} /></button>
      </header>{children}
    </div>
  </dialog>;
}
