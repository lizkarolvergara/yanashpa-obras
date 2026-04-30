import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useObra } from '../../hooks/useObra'
import EstadoBadge from '../../components/obras/EstadoBadge'
import { usePendientes } from '../../hooks/usePendientes'
import PendienteItem from '../../components/campo/PendienteItem'
import PendienteForm from '../../components/campo/PendienteForm'
import { useNotas } from '../../hooks/useNotas'
import NotaCard from '../../components/campo/NotaCard'
import { useChecklist } from '../../hooks/useChecklist'
import ChecklistForm from '../../components/seguridad/ChecklistForm'
import ChecklistResumen from '../../components/seguridad/ChecklistResumen'
import { useDocumentos } from '../../hooks/useDocumentos'
import DocumentoItem from '../../components/documentos/DocumentoItem'
import FileUploader from '../../components/documentos/FileUploader'
import { useAuditorias } from '../../hooks/useAuditorias'
import AuditoriaForm from '../../components/seguridad/AuditoriaForm'
import AuditoriaResumen from '../../components/seguridad/AuditoriaResumen'
import { useContactos } from '../../hooks/useContactos'

type Tab = 'info' | 'documentos' | 'pendientes' | 'notas' | 'seguridad' | 'auditoria'

const tabs: { value: Tab; label: string }[] = [
  { value: 'info',       label: 'Información' },
  { value: 'documentos', label: 'Documentos' },
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'notas',      label: 'Notas' },
  { value: 'seguridad',  label: 'Seguridad' },
  { value: 'auditoria',  label: 'Auditoría' },
]

function formatTipo(tipo: string) {
  const tipos: Record<string, string> = {
    obra_civil:    'Obra civil',
    mantenimiento: 'Mantenimiento',
    jardineria:    'Jardinería',
    carpinteria:   'Carpintería',
  }
  return tipos[tipo] ?? tipo
}

export default function ObraDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { obra, loading, error } = useObra(id!)
  const [tab, setTab] = useState<Tab>('info')
  const [showPendienteForm, setShowPendienteForm] = useState(false)
  const { pendientes, loading: loadingP, createPendiente, toggleEstado, deletePendiente } = usePendientes(id!)
  const [notaTexto, setNotaTexto] = useState('')
  const [savingNota, setSavingNota] = useState(false)
  const { notas, loading: loadingN, createNota, deleteNota } = useNotas(id!)
  const [showChecklistForm, setShowChecklistForm] = useState(false)
  const { checklists, loading: loadingC, createChecklist, deleteChecklist } = useChecklist(id!)
  const [showUploader, setShowUploader] = useState(false)
  const { documentos, loading: loadingD, uploadDocumento, deleteDocumento } = useDocumentos(id!)
  const [showAuditoriaForm, setShowAuditoriaForm] = useState(false)
  const { auditorias, loading: loadingA, createAuditoria, deleteAuditoria } = useAuditorias(id!)
  const [showContactoForm, setShowContactoForm] = useState(false)
  const [contactoForm, setContactoForm] = useState({ nombre: '', cargo: '', telefono: '', email: '' })
  const [savingContacto, setSavingContacto] = useState(false)
  const { contactos, loading: loadingCont, createContacto, deleteContacto } = useContactos(id!)

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
      Cargando...
    </div>
  )

  if (error || !obra) return (
    <div className="flex items-center justify-center py-20 text-red-500 text-sm">
      No se pudo cargar la obra.
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate('/proyectos')}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ← Proyectos
        </button>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6 mt-3">
        <div>
          <h1 className="text-xl font-medium text-gray-900 mb-1">{obra.nombre}</h1>
          <p className="text-sm text-gray-500">{obra.contratista}</p>
        </div>
        <EstadoBadge estado={obra.estado} />
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`text-sm px-4 py-2.5 whitespace-nowrap border-b-2 transition-colors ${
              tab === t.value
                ? 'border-teal-500 text-teal-700 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">Datos del contrato</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Contratista</p>
                <p className="text-gray-800">{obra.contratista}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">RUC</p>
                <p className="text-gray-800">{obra.ruc ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Tipo</p>
                <p className="text-gray-800">{formatTipo(obra.tipo)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Monto contractual</p>
                <p className="text-gray-800">
                  {obra.monto
                    ? `S/. ${obra.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Fecha de inicio</p>
                <p className="text-gray-800">{new Date(obra.fecha_inicio).toLocaleDateString('es-PE')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Fecha de fin</p>
                <p className="text-gray-800">{new Date(obra.fecha_fin).toLocaleDateString('es-PE')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Ubicación</p>
                <p className="text-gray-800">{obra.ubicacion ?? '—'}</p>
              </div>
              {obra.descripcion && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Alcance</p>
                  <p className="text-gray-800 leading-relaxed">{obra.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Datos de contacto</p>
              <button
                onClick={() => setShowContactoForm(true)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                + Agregar contacto
              </button>
            </div>

            {showContactoForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Nombre *"
                    value={contactoForm.nombre}
                    onChange={e => setContactoForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  />
                  <input
                    placeholder="Cargo"
                    value={contactoForm.cargo}
                    onChange={e => setContactoForm(prev => ({ ...prev, cargo: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  />
                  <input
                    placeholder="Teléfono"
                    value={contactoForm.telefono}
                    onChange={e => setContactoForm(prev => ({ ...prev, telefono: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  />
                  <input
                    placeholder="Correo"
                    value={contactoForm.email}
                    onChange={e => setContactoForm(prev => ({ ...prev, email: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowContactoForm(false); setContactoForm({ nombre: '', cargo: '', telefono: '', email: '' }) }}
                    className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!contactoForm.nombre.trim() || savingContacto}
                    onClick={async () => {
                      if (!contactoForm.nombre.trim()) return
                      setSavingContacto(true)
                      await createContacto({
                        obra_id: id!,
                        nombre: contactoForm.nombre,
                        cargo: contactoForm.cargo || null,
                        telefono: contactoForm.telefono || null,
                        email: contactoForm.email || null,
                      })
                      setContactoForm({ nombre: '', cargo: '', telefono: '', email: '' })
                      setShowContactoForm(false)
                      setSavingContacto(false)
                    }}
                    className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
                  >
                    {savingContacto ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            )}

            {loadingCont ? (
              <p className="text-sm text-gray-400">Cargando...</p>
            ) : contactos.length === 0 ? (
              <p className="text-sm text-gray-400">No hay contactos registrados.</p>
            ) : (
              <div className="space-y-3">
                {contactos.map(c => (
                  <div key={c.id} className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{c.nombre}</p>
                      {c.cargo && <p className="text-gray-500 text-xs mt-0.5">{c.cargo}</p>}
                      <div className="flex gap-3 mt-1">
                        {c.telefono && (
                          <a href={`tel:${c.telefono}`} className="text-xs text-teal-600 hover:text-teal-700">
                            {c.telefono}
                          </a>
                        )}
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="text-xs text-teal-600 hover:text-teal-700">
                            {c.email}
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteContacto(c.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-1">
            <button
              onClick={() => navigate(`/proyectos/${obra.id}/editar`)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              Editar información →
            </button>
          </div>
        </div>
      )}

      {tab === 'documentos' && (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
                {documentos.length} {documentos.length === 1 ? 'documento' : 'documentos'}
            </p>
            {!showUploader && (
                <button
                onClick={() => setShowUploader(true)}
                className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                + Subir archivo
                </button>
            )}
            </div>

            {showUploader && (
            <FileUploader
                obraId={id!}
                onSave={async (file, meta) => {
                await uploadDocumento(file, meta)
                setShowUploader(false)
                }}
                onCancel={() => setShowUploader(false)}
            />
            )}

            {loadingD ? (
            <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
            ) : documentos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay documentos subidos.</p>
            ) : (
            documentos.map(d => (
                <DocumentoItem
                key={d.id}
                documento={d}
                onDelete={deleteDocumento}
                />
            ))
            )}
        </div>
      )}

      {tab === 'pendientes' && (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
                {pendientes.filter(p => p.estado === 'abierto').length} abiertos ·{' '}
                {pendientes.filter(p => p.estado === 'resuelto').length} resueltos
            </p>
            {!showPendienteForm && (
                <button
                onClick={() => setShowPendienteForm(true)}
                className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                + Agregar
                </button>
            )}
            </div>

            {showPendienteForm && (
            <PendienteForm
                obraId={id!}
                onSave={async (p) => { await createPendiente(p); setShowPendienteForm(false) }}
                onCancel={() => setShowPendienteForm(false)}
            />
            )}

            {loadingP ? (
            <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
            ) : pendientes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay pendientes registrados.</p>
            ) : (
            pendientes.map(p => (
                <PendienteItem
                key={p.id}
                pendiente={p}
                onToggle={toggleEstado}
                onDelete={deletePendiente}
                />
            ))
            )}
        </div>
      )}

      {tab === 'notas' && (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
            <textarea
                value={notaTexto}
                onChange={e => setNotaTexto(e.target.value)}
                placeholder="Escribe una nota de campo..."
                rows={3}
                className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
            />
            <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                <button
                disabled={!notaTexto.trim() || savingNota}
                onClick={async () => {
                    if (!notaTexto.trim()) return
                    setSavingNota(true)
                    await createNota({
                    obra_id: id!,
                    contenido: notaTexto.trim(),
                    foto_url: null,
                    fecha: new Date().toISOString(),
                    })
                    setNotaTexto('')
                    setSavingNota(false)
                }}
                className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
                >
                {savingNota ? 'Guardando...' : 'Guardar nota'}
                </button>
            </div>
            </div>

            {loadingN ? (
            <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
            ) : notas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay notas registradas.</p>
            ) : (
            notas.map(n => (
                <NotaCard key={n.id} nota={n} onDelete={deleteNota} />
            ))
            )}
        </div>
      )}

      {tab === 'seguridad' && (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
                {checklists.length} inspecciones registradas
            </p>
            {!showChecklistForm && (
                <button
                onClick={() => setShowChecklistForm(true)}
                className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                + Nueva inspección
                </button>
            )}
            </div>

            {showChecklistForm && (
            <ChecklistForm
                obraId={id!}
                onSave={async (c) => { await createChecklist(c); setShowChecklistForm(false) }}
                onCancel={() => setShowChecklistForm(false)}
            />
            )}

            {loadingC ? (
            <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
            ) : checklists.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay inspecciones registradas.</p>
            ) : (
            checklists.map(c => (
            <ChecklistResumen
              key={c.id}
              checklist={c}
              onDelete={deleteChecklist}
            />
          ))
            )}
        </div>
      )}

      {tab === 'auditoria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">
              {auditorias.length} auditorías registradas
            </p>
            {!showAuditoriaForm && (
              <button
                onClick={() => setShowAuditoriaForm(true)}
                className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                + Nueva auditoría
              </button>
            )}
          </div>

          {showAuditoriaForm && (
            <AuditoriaForm
              obraId={id!}
              onSave={async (a) => { await createAuditoria(a); setShowAuditoriaForm(false) }}
              onCancel={() => setShowAuditoriaForm(false)}
            />
          )}

          {loadingA ? (
            <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
          ) : auditorias.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay auditorías registradas.</p>
          ) : (
            auditorias.map(a => (
              <AuditoriaResumen
                key={a.id}
                auditoria={a}
                onDelete={deleteAuditoria}
              />
            ))
          )}
        </div>
      )}

    </div>

  )
}