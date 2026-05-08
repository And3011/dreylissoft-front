import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card, Field, Input } from '../components/common';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [identity, setIdentity] = useState('admin');
  const [password, setPassword] = useState('Admin123*');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await api.post('/auth/login', { identity, password });
      setSession(response.data.data.token, response.data.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <Card>
          <div className="login-logo">
            <img
              src="/assets/logo-dreylissoft.png"
              alt="DreylisSoft - Soluciones que conectan tu negocio"
            />
          </div>
          <p className="muted login-eyebrow">DreylisSoft Central</p>
          <h1 className="login-title">Acceso seguro</h1>
          <form onSubmit={submit} className="grid" style={{ marginTop: 26 }}>
            <Field label="Usuario o correo">
              <Input value={identity} onChange={(e: any) => setIdentity(e.target.value)} />
            </Field>
            <Field label="Contraseña">
              <Input type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
            </Field>
            {error ? <div className="badge off" style={{ borderRadius: 10 }}>{error}</div> : null}
            <button className="btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
