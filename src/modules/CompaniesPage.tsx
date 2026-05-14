import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Card, Field, Input, PageHeader, Select } from '../components/common';
import { getErrorMessage } from '../lib/utils';

export function CompaniesPage() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    commercialName: '',
    companyCode: '',
    legalName: '',
    rnc: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'MINIMARKET',
    logoUrl: '',
    active: 1
  });

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await api.get('/companies')).data.data
  });

  const reset = () => {
    setEditingId(null);
    setForm({
      commercialName: '',
      companyCode: '',
      legalName: '',
      rnc: '',
      email: '',
      phone: '',
      address: '',
      businessType: 'MINIMARKET',
      logoUrl: '',
      active: 1
    });
  };

  const save = useMutation({
    mutationFn: async () =>
      editingId
        ? api.put(`/companies/${editingId}`, form)
        : api.post('/companies', form),
    onSuccess: () => {
      setMsg(editingId ? 'Empresa actualizada' : 'Empresa registrada');
      reset();
      qc.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const toggle = useMutation({
    mutationFn: async (company: any) =>
      api.patch(`/companies/${company.id}/status`, {
        active: Number(company.active) === 1 ? 0 : 1
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companies'] }),
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const edit = (company: any) => {
    setEditingId(company.id);
    setForm({
      commercialName: company.commercial_name || '',
      companyCode: company.company_code || '',
      legalName: company.legal_name || '',
      rnc: company.rnc || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      businessType: company.business_type || 'MINIMARKET',
      logoUrl: company.logo_url || '',
      active: Number(company.active) === 1 ? 1 : 0
    });
  };

  const companies = companiesQuery.data || [];

  return (
    <div className="stack">
      <PageHeader
        title="Empresas"
        subtitle="Clientes y negocios conectados a DreylisSoft"
      />

      <Card title={editingId ? 'Editar empresa' : 'Registrar empresa'}>
        <div className="grid grid-4">
          <Field label="Nombre comercial">
            <Input
              value={form.commercialName}
              onChange={(e: any) =>
                setForm({ ...form, commercialName: e.target.value })
              }
            />
          </Field>

          <Field label="Código compañía">
            <Input
              value={form.companyCode}
              onChange={(e: any) =>
                setForm({
                  ...form,
                  companyCode: e.target.value.toUpperCase().replace(/\s+/g, '')
                })
              }
              placeholder="AHORRO001"
            />
          </Field>

          <Field label="Razón social">
            <Input
              value={form.legalName}
              onChange={(e: any) =>
                setForm({ ...form, legalName: e.target.value })
              }
            />
          </Field>

          <Field label="RNC / Cédula">
            <Input
              type="text"
              inputMode="numeric"
              value={form.rnc}
              onChange={(e: any) => setForm({ ...form, rnc: e.target.value })}
            />
          </Field>

          <Field label="Tipo">
            <Select
              value={form.businessType}
              onChange={(e: any) =>
                setForm({ ...form, businessType: e.target.value })
              }
            >
              <option value="MINIMARKET">Minimarket</option>
              <option value="FARMACIA">Farmacia</option>
              <option value="FERRETERIA">Ferretería</option>
              <option value="COLMADO">Colmado</option>
              <option value="CREDITOS">Créditos</option>
              <option value="OTRO">Otro</option>
            </Select>
          </Field>

          <Field label="Correo">
            <Input
              type="email"
              value={form.email}
              onChange={(e: any) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label="Teléfono">
            <Input
              value={form.phone}
              onChange={(e: any) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>

          <Field label="Dirección">
            <Input
              value={form.address}
              onChange={(e: any) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </Field>

          <Field label="Estado">
            <Select
              value={form.active}
              onChange={(e: any) =>
                setForm({ ...form, active: Number(e.target.value) })
              }
            >
              <option value={1}>Activa</option>
              <option value={0}>Inactiva</option>
            </Select>
          </Field>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => save.mutate()}
            disabled={save.isPending}
          >
            {editingId ? 'Actualizar empresa' : 'Guardar empresa'}
          </button>

          {editingId ? (
            <button className="btn secondary" onClick={reset}>
              Cancelar
            </button>
          ) : null}
        </div>

        {msg ? <p className="muted">{msg}</p> : null}
      </Card>

      <Card title="Listado de empresas">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Código</th>
                <th>RNC</th>
                <th>Tipo</th>
                <th>Servicios</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((c: any) => (
                <tr key={c.id}>
                  <td>{c.id}</td>

                  <td>
                    <strong>{c.commercial_name}</strong>
                    <div className="muted">{c.legal_name || '-'}</div>
                  </td>

                  <td>
                    <strong>{c.company_code || '-'}</strong>
                  </td>

                  <td>{c.rnc || '-'}</td>

                  <td>{c.business_type || '-'}</td>

                  <td>{c.service_count || 0}</td>

                  <td>
                    <span
                      className={`badge ${
                        Number(c.active) === 1 ? 'ok' : 'off'
                      }`}
                    >
                      {Number(c.active) === 1 ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button className="btn secondary" onClick={() => edit(c)}>
                        Editar
                      </button>

                      <button
                        className="btn danger"
                        onClick={() => toggle.mutate(c)}
                      >
                        {Number(c.active) === 1 ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!companiesQuery.isLoading && !companies.length ? (
                <tr>
                  <td colSpan={8} className="muted">
                    No hay empresas registradas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}