import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Card, PageHeader } from '../components/common';

export function DashboardPage() {
  const q = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/dashboard')).data.data
  });

  const d = q.data || {};

  return (
    <div className="stack">
      <PageHeader title="Dashboard" subtitle="Resumen general de DreylisSoft Central" />

      <div className="grid grid-4">
        <Card title="Total negocios" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{d.companies || 0}</p>
          <p className="muted">Empresas activas</p>
        </Card>
        <Card title="Servicios activos" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{d.activeServices || 0}</p>
          <p className="muted">Contratos activos</p>
        </Card>
        <Card title="POS" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{d.pos || 0}</p>
          <p className="muted">Minimarkets</p>
        </Card>
        <Card title="Farmacias" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{d.farmacias || 0}</p>
          <p className="muted">Sistemas farmacia</p>
        </Card>
      </div>

      <Card title="Empresas recientes">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              {(d.recentCompanies || []).map((c: any) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td><strong>{c.commercial_name}</strong></td>
                  <td>{c.business_type || '-'}</td>
                  <td><span className={`badge ${Number(c.active) === 1 ? 'ok' : 'off'}`}>{Number(c.active) === 1 ? 'Activa' : 'Inactiva'}</span></td>
                  <td>{c.created_at}</td>
                </tr>
              ))}
              {!q.isLoading && !(d.recentCompanies || []).length ? (
                <tr><td colSpan={5} className="muted">No hay empresas registradas.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
