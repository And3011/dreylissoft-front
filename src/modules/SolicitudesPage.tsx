import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import api from '../lib/api';
import { Card, Field, Input, PageHeader, Select } from '../components/common';
import { getErrorMessage } from '../lib/utils';

type Solicitud = {
  id: number;
  nombre: string;
  empresa: string | null;
  telefono: string;
  correo: string | null;
  tipo_negocio: string | null;
  servicio: string;
  presupuesto: string | null;
  urgencia: string | null;
  descripcion: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion?: string | null;
};

const estados = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'CONTACTADO', label: 'Contactado' },
  { value: 'CERRADO', label: 'Cerrado' }
];

function estadoLabel(value: string) {
  return estados.find((item) => item.value === value)?.label || value;
}

function formatDate(value?: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('es-DO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function SolicitudesPage() {
  const qc = useQueryClient();

  const [estado, setEstado] = useState('TODAS');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [msg, setMsg] = useState('');

  const solicitudesQuery = useQuery({
    queryKey: ['solicitudes', estado, search],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (estado && estado !== 'TODAS') params.set('estado', estado);
      if (search.trim()) params.set('q', search.trim());

      const response = await api.get(`/solicitudes?${params.toString()}`);
      return response.data.data as Solicitud[];
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, nuevoEstado }: { id: number; nuevoEstado: string }) => {
      return api.patch(`/solicitudes/${id}/status`, {
        estado: nuevoEstado
      });
    },
    onSuccess: () => {
      setMsg('Solicitud actualizada correctamente');
      qc.invalidateQueries({ queryKey: ['solicitudes'] });
    },
    onError: (error) => {
      setMsg(getErrorMessage(error));
    }
  });

  const solicitudes = solicitudesQuery.data || [];

  const resumen = useMemo(() => {
    return {
      total: solicitudes.length,
      pendientes: solicitudes.filter((item) => item.estado === 'PENDIENTE').length,
      proceso: solicitudes.filter((item) => item.estado === 'EN_PROCESO').length,
      contactadas: solicitudes.filter((item) => item.estado === 'CONTACTADO').length,
      cerradas: solicitudes.filter((item) => item.estado === 'CERRADO').length
    };
  }, [solicitudes]);

  return (
    <div className="stack">
      <PageHeader
        title="Solicitudes"
        subtitle="Prospectos recibidos desde el formulario público de DreylisSoft"
      />

      <div className="grid grid-4">
        <Card title="Total" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{resumen.total}</p>
          <p className="muted">Solicitudes recibidas</p>
        </Card>

        <Card title="Pendientes" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{resumen.pendientes}</p>
          <p className="muted">Sin gestionar</p>
        </Card>

        <Card title="En proceso" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{resumen.proceso}</p>
          <p className="muted">En seguimiento</p>
        </Card>

        <Card title="Contactadas" className="metric">
          <p style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>{resumen.contactadas}</p>
          <p className="muted">Cliente contactado</p>
        </Card>
      </div>

      <Card title="Filtros">
        <div className="grid grid-3">
          <Field label="Buscar">
            <Input
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              placeholder="Nombre, empresa, teléfono, correo..."
            />
          </Field>

          <Field label="Estado">
            <Select value={estado} onChange={(e: any) => setEstado(e.target.value)}>
              {estados.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>

          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button
              className="btn"
              onClick={() => solicitudesQuery.refetch()}
              disabled={solicitudesQuery.isFetching}
            >
              {solicitudesQuery.isFetching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {msg ? <p className="muted">{msg}</p> : null}
      </Card>

      <Card title="Listado de solicitudes">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Servicio</th>
                <th>Urgencia</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {solicitudes.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id}</td>

                  <td>
                    <strong>{item.nombre}</strong>
                    <div className="muted">{item.empresa || 'Sin empresa'}</div>
                  </td>

                  <td>
                    {item.telefono}
                    <div className="muted">{item.correo || 'Sin correo'}</div>
                  </td>

                  <td>
                    {item.servicio}
                    <div className="muted">{item.tipo_negocio || 'Sin tipo de negocio'}</div>
                  </td>

                  <td>
                    {item.urgencia || '-'}
                    <div className="muted">{item.presupuesto || 'Sin presupuesto'}</div>
                  </td>

                  <td>
                    <Select
                      value={item.estado}
                      onChange={(e: any) =>
                        updateStatus.mutate({
                          id: item.id,
                          nuevoEstado: e.target.value
                        })
                      }
                    >
                      {estados
                        .filter((estado) => estado.value !== 'TODAS')
                        .map((estado) => (
                          <option key={estado.value} value={estado.value}>
                            {estado.label}
                          </option>
                        ))}
                    </Select>
                  </td>

                  <td>{formatDate(item.fecha_creacion)}</td>

                  <td>
                    <div className="actions">
                      <button className="btn secondary" onClick={() => setSelected(item)}>
                        Ver detalle
                      </button>

                      <a
                        className="btn success"
                        href={`https://wa.me/${item.telefono.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </td>
                </tr>
              ))}

              {!solicitudesQuery.isLoading && !solicitudes.length ? (
                <tr>
                  <td colSpan={8} className="muted">
                    No hay solicitudes registradas.
                  </td>
                </tr>
              ) : null}

              {solicitudesQuery.isLoading ? (
                <tr>
                  <td colSpan={8} className="muted">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {selected ? (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="muted">Solicitud #{selected.id}</p>
                <h2>{selected.nombre}</h2>
              </div>

              <button className="btn secondary" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>

            <div className="detail-grid">
              <div>
                <span>Empresa</span>
                <strong>{selected.empresa || '-'}</strong>
              </div>

              <div>
                <span>Teléfono</span>
                <strong>{selected.telefono}</strong>
              </div>

              <div>
                <span>Correo</span>
                <strong>{selected.correo || '-'}</strong>
              </div>

              <div>
                <span>Tipo de negocio</span>
                <strong>{selected.tipo_negocio || '-'}</strong>
              </div>

              <div>
                <span>Servicio</span>
                <strong>{selected.servicio}</strong>
              </div>

              <div>
                <span>Presupuesto</span>
                <strong>{selected.presupuesto || '-'}</strong>
              </div>

              <div>
                <span>Urgencia</span>
                <strong>{selected.urgencia || '-'}</strong>
              </div>

              <div>
                <span>Estado</span>
                <strong>{estadoLabel(selected.estado)}</strong>
              </div>
            </div>

            <div className="description-box">
              <span>Descripción</span>
              <p>{selected.descripcion}</p>
            </div>

            <div className="actions" style={{ marginTop: 18 }}>
              <a
                className="btn success"
                href={`https://wa.me/${selected.telefono.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                Contactar por WhatsApp
              </a>

              {selected.correo ? (
                <a className="btn secondary" href={`mailto:${selected.correo}`}>
                  Enviar correo
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}