import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Card, Field, Input, PageHeader, Select } from '../components/common';
import { formatCurrency, getErrorMessage } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export function ServicesPage() {
  const qc = useQueryClient();
  const { activeCompany } = useAuth();

  const [msg, setMsg] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  const emptyServiceForm = {
    code: '',
    name: '',
    description: '',
    frontendUrl: '',
    apiUrl: '',
    active: 1
  };

  const [serviceForm, setServiceForm] = useState(emptyServiceForm);

  const [assignForm, setAssignForm] = useState({
    companyId: '',
    serviceId: '',
    planName: 'Plan inicial',
    monthlyPrice: '',
    status: 'ACTIVE'
  });

  const [accessForm, setAccessForm] = useState({
    companyId: '',
    companyServiceId: '',
    username: '',
    password: '',
    fullName: '',
    active: 1
  });

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => (await api.get('/services')).data.data
  });

  const companiesQuery = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await api.get('/companies')).data.data
  });

  const selectedCompanyServicesQuery = useQuery({
    queryKey: ['company-services-form', accessForm.companyId],
    enabled: Boolean(accessForm.companyId),
    queryFn: async () =>
      (await api.get(`/companies/${accessForm.companyId}/services`)).data.data
  });

  const companyServicesQuery = useQuery({
    queryKey: ['company-services', activeCompany?.id],
    enabled: Boolean(activeCompany?.id),
    queryFn: async () =>
      (await api.get(`/companies/${activeCompany?.id}/services`)).data.data
  });

  const serviceAccessUsersQuery = useQuery({
    queryKey: ['service-access-users'],
    queryFn: async () => (await api.get('/service-access-users')).data.data
  });

  const saveService = useMutation({
    mutationFn: async () =>
      editingServiceId
        ? api.put(`/services/${editingServiceId}`, serviceForm)
        : api.post('/services', serviceForm),

    onSuccess: () => {
      setMsg(
        editingServiceId
          ? 'Servicio actualizado correctamente'
          : 'Servicio registrado correctamente'
      );

      setEditingServiceId(null);
      setServiceForm(emptyServiceForm);

      qc.invalidateQueries({ queryKey: ['services'] });
      qc.invalidateQueries({ queryKey: ['company-services'] });
      qc.invalidateQueries({ queryKey: ['company-services-form'] });
      qc.invalidateQueries({ queryKey: ['companies'] });
    },

    onError: (e) => setMsg(getErrorMessage(e))
  });

  const assignService = useMutation({
    mutationFn: async () =>
      api.post('/services/assign', {
        companyId: Number(assignForm.companyId),
        serviceId: Number(assignForm.serviceId),
        planName: assignForm.planName || null,
        monthlyPrice: Number(assignForm.monthlyPrice || 0),
        status: assignForm.status
      }),
    onSuccess: () => {
      setMsg('Servicio asignado correctamente');
      setAssignForm({
        companyId: '',
        serviceId: '',
        planName: 'Plan inicial',
        monthlyPrice: '',
        status: 'ACTIVE'
      });
      qc.invalidateQueries({ queryKey: ['company-services'] });
      qc.invalidateQueries({ queryKey: ['company-services-form'] });
      qc.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const createAccessUser = useMutation({
    mutationFn: async () =>
      api.post('/service-access-users', {
        companyId: Number(accessForm.companyId),
        companyServiceId: Number(accessForm.companyServiceId),
        username: accessForm.username,
        password: accessForm.password,
        fullName: accessForm.fullName,
        active: Number(accessForm.active)
      }),
    onSuccess: () => {
      setMsg('Usuario maestro creado correctamente');
      setAccessForm({
        companyId: '',
        companyServiceId: '',
        username: '',
        password: '',
        fullName: '',
        active: 1
      });
      qc.invalidateQueries({ queryKey: ['service-access-users'] });
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const toggleAccessUser = useMutation({
    mutationFn: async (row: any) =>
      api.patch(`/service-access-users/${row.id}`, {
        active: Number(row.active) === 1 ? 0 : 1
      }),
    onSuccess: () => {
      setMsg('Usuario maestro actualizado correctamente');
      qc.invalidateQueries({ queryKey: ['service-access-users'] });
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const resetAccessPassword = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) =>
      api.patch(`/service-access-users/${id}/reset-password`, { password }),
    onSuccess: () => {
      setMsg('Contraseña actualizada correctamente');
    },
    onError: (e) => setMsg(getErrorMessage(e))
  });

  const services = servicesQuery.data || [];
  const companies = companiesQuery.data || [];
  const companyServices = companyServicesQuery.data || [];
  const selectedCompanyServices = selectedCompanyServicesQuery.data || [];
  const serviceAccessUsers = serviceAccessUsersQuery.data || [];

  const selectedCompany = useMemo(() => {
    return companies.find(
      (item: any) => Number(item.id) === Number(accessForm.companyId)
    );
  }, [companies, accessForm.companyId]);

  const cancelServiceEdit = () => {
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm);
  };

  return (
    <div className="stack">
      <PageHeader
        title="Servicios"
        subtitle="Productos contratables, contratos por empresa y usuarios maestro de acceso"
      />

      <Card title={editingServiceId ? 'Editar servicio' : 'Crear servicio'}>
        <div className="grid grid-3">
          <Field label="Código">
            <Input
              value={serviceForm.code}
              onChange={(e: any) =>
                setServiceForm({
                  ...serviceForm,
                  code: e.target.value.toUpperCase()
                })
              }
              placeholder="COLEGIO"
            />
          </Field>

          <Field label="Nombre">
            <Input
              value={serviceForm.name}
              onChange={(e: any) =>
                setServiceForm({ ...serviceForm, name: e.target.value })
              }
              placeholder="Sistema Colegio"
            />
          </Field>

          <Field label="Estado">
            <Select
              value={serviceForm.active}
              onChange={(e: any) =>
                setServiceForm({
                  ...serviceForm,
                  active: Number(e.target.value)
                })
              }
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </Select>
          </Field>

          <Field label="URL Frontend">
            <Input
              value={serviceForm.frontendUrl}
              onChange={(e: any) =>
                setServiceForm({
                  ...serviceForm,
                  frontendUrl: e.target.value
                })
              }
              placeholder="https://colegio-front-production-8897.up.railway.app"
            />
          </Field>

          <Field label="URL API">
            <Input
              value={serviceForm.apiUrl}
              onChange={(e: any) =>
                setServiceForm({ ...serviceForm, apiUrl: e.target.value })
              }
              placeholder="https://colegio-api-production.up.railway.app/api"
            />
          </Field>

          <Field label="Descripción">
            <Input
              value={serviceForm.description}
              onChange={(e: any) =>
                setServiceForm({
                  ...serviceForm,
                  description: e.target.value
                })
              }
            />
          </Field>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => saveService.mutate()}
            disabled={saveService.isPending}
          >
            {editingServiceId
              ? saveService.isPending
                ? 'Actualizando...'
                : 'Actualizar servicio'
              : saveService.isPending
                ? 'Guardando...'
                : 'Guardar servicio'}
          </button>

          {editingServiceId ? (
            <button className="btn secondary" onClick={cancelServiceEdit}>
              Cancelar
            </button>
          ) : null}
        </div>

        {msg ? <p className="muted">{msg}</p> : null}
      </Card>

      <Card title="Listado de servicios">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Código</th>
                <th>Servicio</th>
                <th>Frontend URL</th>
                <th>API URL</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {services.map((s: any) => (
                <tr key={s.id}>
                  <td>{s.id}</td>

                  <td>
                    <strong>{s.code}</strong>
                  </td>

                  <td>
                    <strong>{s.name}</strong>
                    <div className="muted">{s.description || '-'}</div>
                  </td>

                  <td>
                    <span className="muted">{s.frontend_url || '-'}</span>
                  </td>

                  <td>
                    <span className="muted">{s.api_url || '-'}</span>
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        Number(s.active) === 1 ? 'ok' : 'off'
                      }`}
                    >
                      {Number(s.active) === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setEditingServiceId(s.id);

                        setServiceForm({
                          code: s.code || '',
                          name: s.name || '',
                          description: s.description || '',
                          frontendUrl: s.frontend_url || '',
                          apiUrl: s.api_url || '',
                          active: Number(s.active) === 1 ? 1 : 0
                        });

                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}

              {!servicesQuery.isLoading && !services.length ? (
                <tr>
                  <td colSpan={7} className="muted">
                    No hay servicios registrados.
                  </td>
                </tr>
              ) : null}

              {servicesQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="muted">
                    Cargando servicios...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Asignar servicio a empresa">
        <div className="grid grid-4">
          <Field label="Empresa">
            <Select
              value={assignForm.companyId}
              onChange={(e: any) =>
                setAssignForm({ ...assignForm, companyId: e.target.value })
              }
            >
              <option value="">Seleccione</option>
              {companies.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.commercial_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Servicio">
            <Select
              value={assignForm.serviceId}
              onChange={(e: any) =>
                setAssignForm({ ...assignForm, serviceId: e.target.value })
              }
            >
              <option value="">Seleccione</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Plan">
            <Input
              value={assignForm.planName}
              onChange={(e: any) =>
                setAssignForm({ ...assignForm, planName: e.target.value })
              }
            />
          </Field>

          <Field label="Precio mensual">
            <Input
              type="number"
              value={assignForm.monthlyPrice}
              onChange={(e: any) =>
                setAssignForm({
                  ...assignForm,
                  monthlyPrice: e.target.value
                })
              }
              placeholder="0.00"
            />
          </Field>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button
            className="btn success"
            onClick={() => assignService.mutate()}
            disabled={assignService.isPending}
          >
            Asignar servicio
          </button>
        </div>
      </Card>

      <Card title="Crear usuario maestro de acceso">
        <p className="muted" style={{ marginTop: 0 }}>
          Este usuario valida el código de compañía y redirige al login del servicio contratado.
          No entra al backoffice DreylisSoft ni reemplaza los usuarios internos del sistema destino.
        </p>

        <div className="grid grid-3">
          <Field label="Empresa">
            <Select
              value={accessForm.companyId}
              onChange={(e: any) =>
                setAccessForm({
                  ...accessForm,
                  companyId: e.target.value,
                  companyServiceId: ''
                })
              }
            >
              <option value="">Seleccione</option>
              {companies.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.commercial_name}
                  {c.company_code ? ` (${c.company_code})` : ''}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Servicio contratado">
            <Select
              value={accessForm.companyServiceId}
              onChange={(e: any) =>
                setAccessForm({
                  ...accessForm,
                  companyServiceId: e.target.value
                })
              }
              disabled={!accessForm.companyId || selectedCompanyServicesQuery.isLoading}
            >
              <option value="">
                {accessForm.companyId ? 'Seleccione' : 'Seleccione empresa primero'}
              </option>

              {selectedCompanyServices.map((cs: any) => (
                <option
                  key={cs.company_service_id || cs.id}
                  value={cs.company_service_id || cs.id}
                >
                  {cs.service_name || cs.name} - {cs.status}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Estado">
            <Select
              value={accessForm.active}
              onChange={(e: any) =>
                setAccessForm({ ...accessForm, active: Number(e.target.value) })
              }
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </Select>
          </Field>

          <Field label="Usuario maestro">
            <Input
              value={accessForm.username}
              onChange={(e: any) =>
                setAccessForm({ ...accessForm, username: e.target.value })
              }
              placeholder="admin"
            />
          </Field>

          <Field label="Nombre completo">
            <Input
              value={accessForm.fullName}
              onChange={(e: any) =>
                setAccessForm({ ...accessForm, fullName: e.target.value })
              }
              placeholder={`Administrador ${selectedCompany?.commercial_name || ''}`.trim()}
            />
          </Field>

          <Field label="Contraseña temporal">
            <Input
              type="password"
              value={accessForm.password}
              onChange={(e: any) =>
                setAccessForm({ ...accessForm, password: e.target.value })
              }
              placeholder="Admin123*"
            />
          </Field>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => createAccessUser.mutate()}
            disabled={createAccessUser.isPending}
          >
            {createAccessUser.isPending ? 'Creando...' : 'Crear usuario maestro'}
          </button>
        </div>
      </Card>

      <Card title="Usuarios maestro de servicios">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Servicio</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {serviceAccessUsers.map((row: any) => (
                <tr key={row.id}>
                  <td>{row.id}</td>

                  <td>
                    <strong>{row.commercial_name}</strong>
                    <div className="muted">{row.company_code || '-'}</div>
                  </td>

                  <td>
                    {row.service_name}
                    <div className="muted">{row.service_code}</div>
                  </td>

                  <td>{row.username}</td>

                  <td>{row.full_name}</td>

                  <td>
                    <span
                      className={`badge ${Number(row.active) === 1 ? 'ok' : 'off'}`}
                    >
                      {Number(row.active) === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td>
                    <div className="actions">
                      <button
                        className="btn secondary"
                        onClick={() => {
                          const password = window.prompt(
                            `Nueva contraseña para ${row.username}`
                          );

                          if (!password) return;

                          resetAccessPassword.mutate({
                            id: row.id,
                            password
                          });
                        }}
                        disabled={resetAccessPassword.isPending}
                      >
                        Reset clave
                      </button>

                      <button
                        className="btn danger"
                        onClick={() => toggleAccessUser.mutate(row)}
                        disabled={toggleAccessUser.isPending}
                      >
                        {Number(row.active) === 1 ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!serviceAccessUsersQuery.isLoading && !serviceAccessUsers.length ? (
                <tr>
                  <td colSpan={7} className="muted">
                    No hay usuarios maestro registrados.
                  </td>
                </tr>
              ) : null}

              {serviceAccessUsersQuery.isLoading ? (
                <tr>
                  <td colSpan={7} className="muted">
                    Cargando usuarios maestro...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {!activeCompany ? (
        <Card title="Seleccione una empresa">
          <p className="muted">
            Selecciona una empresa activa en la parte superior para ver sus servicios contratados.
          </p>
        </Card>
      ) : (
        <Card title={`Servicios contratados - ${activeCompany.commercial_name}`}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Empresa</th>
                  <th>Servicio</th>
                  <th>Plan</th>
                  <th>Mensualidad</th>
                  <th>Estado</th>
                  <th>URL</th>
                </tr>
              </thead>

              <tbody>
                {companyServices.map((row: any) => (
                  <tr key={row.company_service_id || row.id}>
                    <td>{row.company_service_id || row.id}</td>

                    <td>
                      <strong>
                        {row.commercial_name || activeCompany.commercial_name}
                      </strong>
                    </td>

                    <td>
                      {row.service_name || row.name}
                      <div className="muted">{row.code}</div>
                    </td>

                    <td>{row.plan_name || '-'}</td>

                    <td>{formatCurrency(Number(row.monthly_price || 0))}</td>

                    <td>
                      <span
                        className={`badge ${
                          row.status === 'ACTIVE' ? 'ok' : 'off'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td>
                      <span className="muted">{row.frontend_url || '-'}</span>
                    </td>
                  </tr>
                ))}

                {!companyServicesQuery.isLoading && !companyServices.length ? (
                  <tr>
                    <td colSpan={7} className="muted">
                      No hay servicios contratados para esta empresa.
                    </td>
                  </tr>
                ) : null}

                {companyServicesQuery.isLoading ? (
                  <tr>
                    <td colSpan={7} className="muted">
                      Cargando servicios contratados...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}