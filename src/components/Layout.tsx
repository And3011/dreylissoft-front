import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function HomeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" /></svg>;
}

function BuildingIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9h.01" /><path d="M9 13h.01" /><path d="M9 17h.01" /><path d="M13 13h.01" /><path d="M13 17h.01" /></svg>;
}

function LayersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5Z" /><path d="m2 12 10 5 10-5" /><path d="m2 17 10 5 10-5" /></svg>;
}

function LogoutIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>;
}

const items: Array<{ to: string; label: string; permission: string; Icon: () => JSX.Element }> = [
  { to: '/dashboard', label: 'Dashboard', permission: 'dashboard.view', Icon: HomeIcon },
  { to: '/companies', label: 'Empresas', permission: 'companies.view', Icon: BuildingIcon },
  { to: '/services', label: 'Servicios', permission: 'services.view', Icon: LayersIcon },
  { to: '/solicitudes', label: 'Solicitudes', permission: 'dashboard.view', Icon: LayersIcon }
];

export function Layout() {
  const {
    user,
    logout,
    hasPermission,
    companies,
    activeCompany,
    setActiveCompany,
    loadMyCompanies
  } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (!companies.length) {
      loadMyCompanies().catch(() => {
        // No bloqueamos el layout si no carga empresas.
      });
    }
  }, []);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand-mark">
            <img src="/assets/dreylissoft-logo-icon.png" alt="DreylisSoft" className="sidebar-logo-icon" />
          </div>
          <div className="sidebar-brand-copy">
            <small>DreylisSoft</small>
            <strong>Central ERP</strong>
          </div>
        </div>

        <nav className="nav">
          {items
            .filter((item) => hasPermission(item.permission))
            .map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} className="nav-link">
                <span className="nav-icon"><Icon /></span>
                <span>{label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-avatar">
            {(user?.fullName || user?.username || 'A').slice(0, 1).toUpperCase()}
          </div>
          <div className="sidebar-user-copy">
            <strong>{user?.fullName || user?.username}</strong>
            <span>{user?.roleName || 'Usuario'}</span>
          </div>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <div className="muted">Backoffice DreylisSoft</div>
            <strong>{user?.fullName || user?.username}</strong>
            <div className="muted">{user?.roleName}</div>
          </div>

          <div className="topbar-actions">
            <div className="company-switcher">
              <span>Empresa activa</span>

              <select
                value={activeCompany?.id || ''}
                onChange={(event) => {
                  const company = companies.find(
                    (item) => Number(item.id) === Number(event.target.value)
                  );

                  setActiveCompany(company || null);
                }}
              >
                {!activeCompany ? <option value="">Seleccione empresa</option> : null}

                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.commercial_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn topbar-logout"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <span className="btn-inline-icon"><LogoutIcon /></span>
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}