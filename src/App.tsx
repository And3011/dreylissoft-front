import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './modules/LoginPage';
import { DashboardPage } from './modules/DashboardPage';
import { CompaniesPage } from './modules/CompaniesPage';
import { ServicesPage } from './modules/ServicesPage';
import { SolicitudesPage } from './modules/SolicitudesPage';

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="companies" element={<CompaniesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="/solicitudes" element={<SolicitudesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
