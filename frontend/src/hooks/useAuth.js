import { useState } from 'react';

// There is no database behind this, so one demo account stands in for sign-up.
// The credentials are shown on the login page on purpose.
export const DEMO_USER = { email: 'demo@ante.app', password: 'yourmove', name: 'Demo player' };

const SESSION_KEY = 'ante.session.v1';

// Storage can throw in private windows, so every touch of it is guarded and a
// failure just means the session does not outlive the tab.
function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return saved?.email === DEMO_USER.email ? { email: saved.email, name: DEMO_USER.name } : null;
  } catch { return null; }
}

export function useAuth() {
  const [user, setUser] = useState(readSession);

  return {
    user,
    signIn(email, password) {
      const cleaned = String(email ?? '').trim().toLowerCase();
      if (cleaned !== DEMO_USER.email || password !== DEMO_USER.password)
        throw new Error('That is not the demo account. Check the details below the form.');
      const session = { email: DEMO_USER.email, name: DEMO_USER.name };
      try { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* not worth failing the sign-in */ }
      setUser(session);
    },
    signOut() {
      try { window.localStorage.removeItem(SESSION_KEY); } catch { /* nothing left to clean up */ }
      setUser(null);
    },
  };
}
