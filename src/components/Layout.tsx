import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const items = [
  ['/dashboard', 'Dashboard', 'dashboard.view'],
  ['/companies', 'Empresas', 'companies.view'],
  ['/services', 'Servicios', 'services.view']
];

export function Layout() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <small>DREYLISSOFT</small>
          <h1>Central ERP</h1>
        </div>
        <nav className="nav">
          {items
            .filter(([, , permission]) => hasPermission(permission))
            .map(([to, label]) => (
              <NavLink key={to} to={to}>{label}</NavLink>
            ))}
        </nav>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <div className="muted">Backoffice DreylisSoft</div>
            <strong>{user?.fullName || user?.username}</strong>
            <div className="muted">{user?.roleName}</div>
          </div>
          <button
            className="btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Cerrar sesión
          </button>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
