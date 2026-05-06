import { createContext, useContext, useMemo, useState } from 'react';

type AuthContextValue = {
  token: string | null;
  user: any | null;
  setSession: (token: string, user: any) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('dreylissoft_token'));
  const [user, setUser] = useState<any>(() => {
    const raw = localStorage.getItem('dreylissoft_user');
    return raw ? JSON.parse(raw) : null;
  });

  const value = useMemo<AuthContextValue>(() => ({
    token,
    user,
    setSession: (newToken, newUser) => {
      localStorage.setItem('dreylissoft_token', newToken);
      localStorage.setItem('dreylissoft_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    },
    logout: () => {
      localStorage.removeItem('dreylissoft_token');
      localStorage.removeItem('dreylissoft_user');
      setToken(null);
      setUser(null);
    },
    hasPermission: (permission) => {
      return (user?.permissions || []).includes(permission);
    }
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
