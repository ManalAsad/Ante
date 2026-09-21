// The Ante mark: the club suit on its own, drawn in the surrounding text colour
// so it works on the sidebar's tinted glass and on the white login panel.
export default function AnteMark({ size = 32, title }) {
  return <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor"
    role={title ? 'img' : 'presentation'} aria-label={title} focusable="false" className="ante-mark">
    <circle cx="16" cy="10.4" r="6.9" />
    <circle cx="10.3" cy="20.4" r="6.9" />
    <circle cx="22.7" cy="20.4" r="6.9" />
    <path d="M16 18.6c1.7 5.9-.6 9.9-5.1 12.4h10.2c-4.5-2.5-6.8-6.5-5.1-12.4Z" />
  </svg>;
}
