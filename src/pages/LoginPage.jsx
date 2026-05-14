import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="login-page">
      <div className="login-box fade-in">
        {/* Logo */}
        <div className="login-logo">CITY<span>FILES</span></div>
        <div className="login-tagline">// GTA V ROLEPLAY DATABASE //</div>

        <p style={{ marginBottom: 32, fontSize: '1rem' }}>
          La enciclopedia de servidores, personajes y roleadores del rol en GTA V.
          Inicia sesión para contribuir.
        </p>

        <button className="btn btn-google" onClick={loginWithGoogle} id="btn-google-login">
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            style={{ width: 20, height: 20 }}
          />
          Continuar con Google
        </button>

        <p style={{ marginTop: 24, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          Al iniciar sesión aceptas que tu contenido sea visible públicamente.
        </p>
      </div>
    </div>
  );
}
