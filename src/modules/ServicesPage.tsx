import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Card, Field, Input, PageHeader, Select } from '../components/common';
import { formatCurrency, getErrorMessage } from '../lib/utils';

export function ServicesPage() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const [serviceForm, setServiceForm] = useState({
    code: '',
    name: '',
    description: '',
    frontendUrl: '',
    apiUrl: '',
    active: 1
  });
  const [assignForm, setAssignForm] = useState({
    companyId: '',
    serviceId: '',
    planName: 'Plan inicial',
    monthlyPrice: '',
    status: 'ACTIVE'
  });

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get('/services')).data.data
  });

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await api.get('/companies')).data.data
  });

  const companyServicesQuery = useQuery({
    queryKey: ['company-services'],
    queryFn: async () => (await api.get('/services/company-services')).data.data
  });

  const createService = useMutation({
    mutationFn: async () => api.post('/services', serviceForm),
    onSuccess: () => {
      setMsg('Servicio registrado correctamente');
      setServiceForm({ code: '', name: '', description: '', frontendUrl: '', apiUrl: '', active: 1 });
      qc.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const assignService = useMutation({
    mutationFn: async () => api.post('/services/assign', {
      companyId: Number(assignForm.companyId),
      serviceId: Number(assignForm.serviceId),
      planName: assignForm.planName || null,
      monthlyPrice: Number(assignForm.monthlyPrice || 0),
      status: assignForm.status
    }),
    onSuccess: () => {
      setMsg('Servicio asignado correctamente');
      setAssignForm({ companyId: '', serviceId: '', planName: 'Plan inicial', monthlyPrice: '', status: 'ACTIVE' });
      qc.invalidateQueries({ queryKey: ['company-services'] });
      qc.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const openService = useMutation({
    mutationFn: async (companyServiceId: number) => {
      const response = await api.post(`/service-open/company-services/${companyServiceId}/open`);
      return response.data.data;
    },
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const services = servicesQuery.data || [];
  const companies = companiesQuery.data || [];
  const companyServices = companyServicesQuery.data || [];

  return (
    <div className="stack">
      <PageHeader title="Servicios" subtitle="Productos contratables y apertura de subsistemas" />

      <Card title="Crear servicio">
        <div className="grid grid-3">
          <Field label="Código"><Input value={serviceForm.code} onChange={(e: any) => setServiceForm({ ...serviceForm, code: e.target.value.toUpperCase() })} placeholder="MINIMARKET_POS" /></Field>
          <Field label="Nombre"><Input value={serviceForm.name} onChange={(e: any) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="POS Minimarket" /></Field>
          <Field label="Estado"><Select value={serviceForm.active} onChange={(e: any) => setServiceForm({ ...serviceForm, active: Number(e.target.value) })}><option value={1}>Activo</option><option value={0}>Inactivo</option></Select></Field>
          <Field label="URL Frontend"><Input value={serviceForm.frontendUrl} onChange={(e: any) => setServiceForm({ ...serviceForm, frontendUrl: e.target.value })} placeholder="http://localhost:5173" /></Field>
          <Field label="URL API"><Input value={serviceForm.apiUrl} onChange={(e: any) => setServiceForm({ ...serviceForm, apiUrl: e.target.value })} placeholder="http://localhost:4000/api" /></Field>
          <Field label="Descripción"><Input value={serviceForm.description} onChange={(e: any) => setServiceForm({ ...serviceForm, description: e.target.value })} /></Field>
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => createService.mutate()} disabled={createService.isPending}>Guardar servicio</button>
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
      </Card>

      <Card title="Asignar servicio a empresa">
        <div className="grid grid-4">
          <Field label="Empresa">
            <Select value={assignForm.companyId} onChange={(e: any) => setAssignForm({ ...assignForm, companyId: e.target.value })}>
              <option value="">Seleccione</option>
              {companies.map((c: any) => <option key={c.id} value={c.id}>{c.commercial_name}</option>)}
            </Select>
          </Field>
          <Field label="Servicio">
            <Select value={assignForm.serviceId} onChange={(e: any) => setAssignForm({ ...assignForm, serviceId: e.target.value })}>
              <option value="">Seleccione</option>
              {services.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Plan"><Input value={assignForm.planName} onChange={(e: any) => setAssignForm({ ...assignForm, planName: e.target.value })} /></Field>
          <Field label="Precio mensual"><Input type="number" value={assignForm.monthlyPrice} onChange={(e: any) => setAssignForm({ ...assignForm, monthlyPrice: e.target.value })} placeholder="0.00" /></Field>
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn success" onClick={() => assignService.mutate()} disabled={assignService.isPending}>Asignar servicio</button>
        </div>
      </Card>

      <Card title="Servicios contratados">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Empresa</th><th>Servicio</th><th>Plan</th><th>Mensualidad</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {companyServices.map((row: any) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td><strong>{row.commercial_name}</strong></td>
                  <td>{row.service_name}<div className="muted">{row.code}</div></td>
                  <td>{row.plan_name || '-'}</td>
                  <td>{formatCurrency(Number(row.monthly_price || 0))}</td>
                  <td><span className={`badge ${row.status === 'ACTIVE' ? 'ok' : 'off'}`}>{row.status}</span></td>
                  <td><button className="btn" onClick={() => openService.mutate(row.id)} disabled={openService.isPending}>Abrir</button></td>
                </tr>
              ))}
              {!companyServicesQuery.isLoading && !companyServices.length ? <tr><td colSpan={7} className="muted">No hay servicios contratados.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
