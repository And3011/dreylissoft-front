import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Input } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/utils';

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      <path d="m22 8-8.97 5.7a2 2 0 0 1-2.06 0L2 8" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

function CompanyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 10h.01" />
      <path d="M9 14h.01" />
      <path d="M15 10h.01" />
      <path d="M15 14h.01" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.42 7.63 7.36 5 12 5s8.58 2.63 9.94 6.65a1 1 0 0 1 0 .7C20.58 16.37 16.64 19 12 19s-8.58-2.63-9.94-6.65Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m2 2 20 20" />
      <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
      <path d="M9.36 5.37A10.94 10.94 0 0 1 12 5c4.64 0 8.58 2.63 9.94 6.65a1 1 0 0 1 0 .7 11.05 11.05 0 0 1-4.25 5.17" />
      <path d="M6.61 6.61A11.05 11.05 0 0 0 2.06 11.65a1 1 0 0 0 0 .7C3.42 16.37 7.36 19 12 19c1.67 0 3.26-.34 4.71-.95" />
    </svg>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [companyCode, setCompanyCode] = useState('');
  const [identity, setIdentity] = useState('admin');
  const [password, setPassword] = useState('Admin123*');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/auth/login', {
        companyCode: companyCode.trim() || null,
        identity,
        password,
        remember
      });

      const data = response.data.data;

      if (data.action === 'REDIRECT_SERVICE') {
        window.location.href = data.redirectUrl;
        return;
      }

      setSession(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb-top" />
      <div className="login-bg-orb login-bg-orb-bottom" />
      <div className="login-dots login-dots-left" />
      <div className="login-dots login-dots-right" />

      <div className="login-box">
        <div className="login-card brand-card">
          <img
            src="/assets/dreylissoft-logo-horizontal.png"
            alt="DreylisSoft"
            className="login-brand-logo"
          />

          <div className="login-copy">
            <h1>Bienvenido de nuevo</h1>
            <p>
              Accede al backoffice de DreylisSoft o ingresa el código de tu compañía para abrir tu servicio contratado.
            </p>
          </div>

          <form onSubmit={submit} className="grid" style={{ marginTop: 8 }}>
            <div className="field">
              <label>Código compañía</label>
              <div className="input-wrap">
                <span className="input-icon"><CompanyIcon /></span>
                <Input
                  value={companyCode}
                  onChange={(e: any) => setCompanyCode(e.target.value.toUpperCase())}
                  placeholder="Ejemplo: FARMA001"
                  className="with-icon"
                />
              </div>
              <p className="muted" style={{ margin: '6px 0 0', fontSize: 13 }}>
                Déjalo vacío si eres administrador de DreylisSoft.
              </p>
            </div>

            <div className="field">
              <label>Usuario o correo</label>
              <div className="input-wrap">
                <span className="input-icon"><MailIcon /></span>
                <Input
                  value={identity}
                  onChange={(e: any) => setIdentity(e.target.value)}
                  placeholder="usuario@empresa.com"
                  className="with-icon"
                />
              </div>
            </div>

            <div className="field">
              <label>Contraseña</label>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="with-icon with-action"
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Mostrar u ocultar contraseña"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="login-meta-row">
              <label className="remember-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recordarme</span>
              </label>
              <button type="button" className="text-link">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error ? (
              <div className="badge off" style={{ borderRadius: 12 }}>
                {error}
              </div>
            ) : null}

            <button className="btn login-btn" disabled={loading}>
              <span>{loading ? 'Validando...' : 'Continuar'}</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}