import { createContext, useContext, useMemo, useState } from 'react';
import api from '../lib/api';

export type Company = {
  id: number;
  commercial_name: string;
  legal_name: string | null;
  rnc?: string | null;
  email?: string | null;
  phone?: string | null;
  business_type: string | null;
  logo_url?: string | null;
  is_default?: number;
  user_company_active?: number;
  active?: number;
};

type AuthContextValue = {
  token: string | null;
  user: any | null;
  companies: Company[];
  activeCompany: Company | null;
  setSession: (token: string, user: any) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  loadMyCompanies: () => Promise<Company[]>;
  setActiveCompany: (company: Company | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function resolveDefaultCompany(user: any, companies: Company[]) {
  return (
    companies.find((company) => Number(company.is_default) === 1) ||
    companies.find((company) => Number(company.id) === Number(user?.companyId)) ||
    companies[0] ||
    null
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('dreylissoft_token')
  );

  const [user, setUser] = useState<any>(() =>
    readJson<any | null>('dreylissoft_user', null)
  );

  const [companies, setCompanies] = useState<Company[]>(() =>
    readJson<Company[]>('dreylissoft_companies', [])
  );

  const [activeCompany, setActiveCompanyState] = useState<Company | null>(() =>
    readJson<Company | null>('dreylissoft_active_company', null)
  );

  const setActiveCompany = (company: Company | null) => {
    if (company) {
      localStorage.setItem('dreylissoft_active_company', JSON.stringify(company));
    } else {
      localStorage.removeItem('dreylissoft_active_company');
    }

    setActiveCompanyState(company);
  };

  const loadMyCompanies = async () => {
    const response = await api.get('/me/companies');
    const rows = (response.data.data || []) as Company[];

    const defaultCompany = resolveDefaultCompany(user, rows);

    localStorage.setItem('dreylissoft_companies', JSON.stringify(rows));
    setCompanies(rows);
    setActiveCompany(defaultCompany);

    return rows;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      companies,
      activeCompany,

      setSession: (newToken, newUser) => {
        const userCompanies = (newUser?.companies || []) as Company[];
        const defaultCompany = resolveDefaultCompany(newUser, userCompanies);

        localStorage.setItem('dreylissoft_token', newToken);
        localStorage.setItem('dreylissoft_user', JSON.stringify(newUser));
        localStorage.setItem('dreylissoft_companies', JSON.stringify(userCompanies));

        if (defaultCompany) {
          localStorage.setItem(
            'dreylissoft_active_company',
            JSON.stringify(defaultCompany)
          );
        } else {
          localStorage.removeItem('dreylissoft_active_company');
        }

        setToken(newToken);
        setUser(newUser);
        setCompanies(userCompanies);
        setActiveCompanyState(defaultCompany);
      },

      logout: () => {
        localStorage.removeItem('dreylissoft_token');
        localStorage.removeItem('dreylissoft_user');
        localStorage.removeItem('dreylissoft_companies');
        localStorage.removeItem('dreylissoft_active_company');

        setToken(null);
        setUser(null);
        setCompanies([]);
        setActiveCompanyState(null);
      },

      hasPermission: (permission) => {
        return (user?.permissions || []).includes(permission);
      },

      loadMyCompanies,
      setActiveCompany
    }),
    [token, user, companies, activeCompany]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}