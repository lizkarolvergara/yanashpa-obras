import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useObra } from '../../hooks/useObra'
import EstadoBadge from '../../components/obras/EstadoBadge'
import { useNotas } from '../../hooks/useNotas'
import NotaCard from '../../components/campo/NotaCard'
import { useDocumentos } from '../../hooks/useDocumentos'
import DocumentoItem from '../../components/documentos/DocumentoItem'
import FileUploader from '../../components/documentos/FileUploader'
import { useContactos } from '../../hooks/useContactos'
import { supabase } from '../../lib/supabase'
import type { Documento } from '../../types'

type Tab = 'info' | 'documentos' | 'notas' | 'contactos'

const tabs: { value: Tab; label: string }[] = [
  { value: 'info',       label: 'Información' },
  { value: 'documentos', label: 'Documentos' },
  { value: 'notas',      label: 'Notas' },
  { value: 'contactos',  label: 'Contactos' },
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

/** Diferencia en días calendarios entre dos fechas ISO */
function difDias(inicio: string, fin: string): number {
  const a = new Date(inicio + 'T00:00:00')
  const b = new Date(fin + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

export default function ObraDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { obra, loading, error } = useObra(id!)
  const [tab, setTab] = useState<Tab>('info')

  // Notas
  const [notaTexto, setNotaTexto] = useState('')
  const [savingNota, setSavingNota] = useState(false)
  const { notas, loading: loadingN, createNota, deleteNota } = useNotas(id!)

  // Documentos
  const [showUploader, setShowUploader] = useState(false)
  const { documentos, loading: loadingD, uploadDocumento, deleteDocumento } = useDocumentos(id!)

  // Contactos
  const [showContactoForm, setShowContactoForm] = useState(false)
  const [contactoForm, setContactoForm] = useState({ nombre: '', cargo: '', telefono: '', email: '' })
  const [savingContacto, setSavingContacto] = useState(false)
  const { contactos, loading: loadingCont, createContacto, deleteContacto } = useContactos(id!)
  const [editingContactoId, setEditingContactoId] = useState<string | null>(null)
  const [editContactoForm, setEditContactoForm] = useState({ nombre: '', cargo: '', telefono: '', email: '' })
  const [savingEditContacto, setSavingEditContacto] = useState(false)
  const [confirmandoContacto, setConfirmandoContacto] = useState(false)

  // ── Funciones update inline (sin hook dedicado para no romper la estructura) ──

  async function updateDocumento(
    docId: string,
    campos: Partial<Pick<Documento, 'nombre' | 'categoria' | 'descripcion' | 'version'>>
  ) {
    const { error } = await supabase.from('documentos').update(campos).eq('id', docId)
    if (error) throw error
    // Forzar refetch — useDocumentos no expone mutate, recargamos con navigate trick
    // La forma más limpia es recargar el hook; si useDocumentos tiene un refetch, úsalo.
    // Por ahora hacemos reload silencioso via window:
    window.dispatchEvent(new Event('yanashpa:refetch-documentos'))
  }

  async function updateNota(notaId: string, contenido: string) {
    const { error } = await supabase.from('notas_campo').update({ contenido }).eq('id', notaId)
    if (error) throw error
    window.dispatchEvent(new Event('yanashpa:refetch-notas'))
  }

  async function updateContacto(
    contactoId: string,
    campos: { nombre: string; cargo: string | null; telefono: string | null; email: string | null }
  ) {
    const { error } = await supabase.from('contactos').update(campos).eq('id', contactoId)
    if (error) throw error
  }

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

  const plazo = obra.fecha_inicio && obra.fecha_fin
    ? difDias(obra.fecha_inicio, obra.fecha_fin)
    : null

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
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-medium text-gray-900 mb-1">
            {obra.nombre_corto ?? obra.nombre}
          </h1>
          {obra.nombre_corto && (
            <p className="text-xs text-gray-400 mb-1 leading-snug">{obra.nombre}</p>
          )}
          <p className="text-sm text-gray-500">{obra.contratista}</p>
        </div>
        <EstadoBadge estado={obra.estado} />
      </div>

      {/* Pestañas — scroll horizontal en móvil */}
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

      {/* ── INFORMACIÓN ─────────────────────────────────────────────────── */}
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
              {plazo !== null && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Plazo contractual</p>
                  <p className="text-gray-800">{plazo} días calendarios</p>
                </div>
              )}
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

      {/* ── DOCUMENTOS ──────────────────────────────────────────────────── */}
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
                onUpdate={updateDocumento}
              />
            ))
          )}
        </div>
      )}

      {/* ── NOTAS ───────────────────────────────────────────────────────── */}
      {tab === 'notas' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <textarea
              value={notaTexto}
              onChange={e => setNotaTexto(e.target.value)}
              placeholder="Escribe una nota..."
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
              <NotaCard
                key={n.id}
                nota={n}
                onDelete={deleteNota}
                onUpdate={updateNota}
              />
            ))
          )}
        </div>
      )}

      {/* ── CONTACTOS ───────────────────────────────────────────────────── */}
      {tab === 'contactos' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Contactos del proyecto</p>
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
                    onClick={() => {
                      setShowContactoForm(false)
                      setContactoForm({ nombre: '', cargo: '', telefono: '', email: '' })
                    }}
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
                        nombre:   contactoForm.nombre,
                        cargo:    contactoForm.cargo    || null,
                        telefono: contactoForm.telefono || null,
                        email:    contactoForm.email    || null,
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
                {contactos.map(c => {
                  const esEditando = editingContactoId === c.id

                  // Vista edición
                  if (esEditando) {
                    return (
                      <div key={c.id} className="bg-gray-50 border border-teal-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Editar contacto</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
                            <input
                              value={editContactoForm.nombre}
                              onChange={e => setEditContactoForm(prev => ({ ...prev, nombre: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Cargo</label>
                            <input
                              value={editContactoForm.cargo}
                              onChange={e => setEditContactoForm(prev => ({ ...prev, cargo: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
                            <input
                              value={editContactoForm.telefono}
                              onChange={e => setEditContactoForm(prev => ({ ...prev, telefono: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Correo</label>
                            <input
                              value={editContactoForm.email}
                              onChange={e => setEditContactoForm(prev => ({ ...prev, email: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingContactoId(null); setConfirmandoContacto(false) }}
                            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-white transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            disabled={!editContactoForm.nombre.trim() || savingEditContacto}
                            onClick={async () => {
                              if (!editContactoForm.nombre.trim()) return
                              setSavingEditContacto(true)
                              await updateContacto(c.id, {
                                nombre:   editContactoForm.nombre.trim(),
                                cargo:    editContactoForm.cargo.trim()    || null,
                                telefono: editContactoForm.telefono.trim() || null,
                                email:    editContactoForm.email.trim()    || null,
                              })
                              setSavingEditContacto(false)
                              setEditingContactoId(null)
                              setConfirmandoContacto(false)
                            }}
                            className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
                          >
                            {savingEditContacto ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                        <div className="border-t border-gray-200 pt-3">
                          {confirmandoContacto ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-red-500 flex-1">¿Eliminar este contacto?</span>
                              <button
                                onClick={() => { deleteContacto(c.id); setEditingContactoId(null); setConfirmandoContacto(false) }}
                                className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                              >
                                Sí, eliminar
                              </button>
                              <button
                                onClick={() => setConfirmandoContacto(false)}
                                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmandoContacto(true)}
                              className="text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                              Eliminar contacto
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Vista normal
                  return (
                    <div key={c.id} className="flex items-start justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
                      <div className="text-sm flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{c.nombre}</p>
                        {c.cargo && <p className="text-gray-500 text-xs mt-0.5">{c.cargo}</p>}
                        <div className="mt-2 space-y-1.5">
                          {c.telefono && (
                            <div className="flex items-center gap-2">
                              <a href={`tel:${c.telefono}`} className="text-xs text-teal-600 hover:text-teal-700">
                                {c.telefono}
                              </a>
                              <button
                                onClick={() => navigator.clipboard.writeText(c.telefono!)}
                                className="text-gray-400 hover:text-teal-600 transition-colors"
                                title="Copiar teléfono"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />
                                  <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                                </svg>
                              </button>
                            </div>
                          )}
                          {c.email && (
                            <div className="flex items-center gap-2">
                              <a href={`mailto:${c.email}`} className="text-xs text-teal-600 hover:text-teal-700">
                                {c.email}
                              </a>
                              <button
                                onClick={() => navigator.clipboard.writeText(c.email!)}
                                className="text-gray-400 hover:text-teal-600 transition-colors"
                                title="Copiar correo"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <path d="M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666" />
                                  <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditContactoForm({
                            nombre:   c.nombre,
                            cargo:    c.cargo    ?? '',
                            telefono: c.telefono ?? '',
                            email:    c.email    ?? '',
                          })
                          setConfirmandoContacto(false)
                          setEditingContactoId(c.id)
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0 transition-colors"
                      >
                        Editar
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
