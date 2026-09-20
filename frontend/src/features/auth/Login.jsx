import { useState } from 'react';
import { ArrowRight, ImageIcon } from 'lucide-react';
import AnteMark from '../../components/AnteMark.jsx';
import { DEMO_USER } from '../../hooks/useAuth.js';

// Drop your own picture in at frontend/public/login.jpg and it shows up here.
// Until that file exists the <img> fails to load and the placeholder takes over.
const IMAGE_URL = '/login.jpg';

export default function Login({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasImage, setHasImage] = useState(true);

  const submit = (event) => {
    event.preventDefault();
    try { onSignIn(email, password); }
    catch (err) { setError(err.message); }
  };

  return <div className="auth-shell">
    <aside className="auth-art">
      {hasImage
        ? <img src={IMAGE_URL} alt="" onError={() => setHasImage(false)} />
        : <div className="auth-art-placeholder">
        </div>}
    </aside>

    <main className="auth-panel">
      <form className="auth-form" onSubmit={submit}>
        <span className="auth-logo"><AnteMark size={52} title="Ante" /></span>
        <h1>Ante</h1>
        <p className="auth-tagline">Your move</p>

        <label>Email
          <input type="email" value={email} autoComplete="username" placeholder={DEMO_USER.email}
            onChange={(event) => { setEmail(event.target.value); setError(''); }} />
        </label>

        <label>Password
          <input type="password" value={password} autoComplete="current-password" placeholder="••••••••"
            onChange={(event) => { setPassword(event.target.value); setError(''); }} />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button className="button primary auth-submit" type="submit">
          Continue<ArrowRight size={17} /></button>


      </form>
    </main>
  </div>;
}
