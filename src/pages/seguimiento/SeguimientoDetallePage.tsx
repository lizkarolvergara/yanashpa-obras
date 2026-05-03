import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useObra } from '../../hooks/useObra'
import EstadoBadge from '../../components/obras/EstadoBadge'
import { usePendientes } from '../../hooks/usePendientes'
import PendienteItem from '../../components/campo/PendienteItem'
import PendienteForm from '../../components/campo/PendienteForm'
import { useChecklist } from '../../hooks/useChecklist'
import ChecklistForm from '../../components/seguridad/ChecklistForm'
import ChecklistResumen from '../../components/seguridad/ChecklistResumen'
import { useAuditorias } from '../../hooks/useAuditorias'
import AuditoriaForm from '../../components/seguridad/AuditoriaForm'
import AuditoriaResumen from '../../components/seguridad/AuditoriaResumen'
import { useBitacora } from '../../hooks/useBitacora'
import BitacoraCard from '../../components/bitacora/BitacoraCard'
import { supabase } from '../../lib/supabase'

type Tab = 'pendientes' | 'bitacora' | 'seguridad' | 'auditoria'

const tabs: { value: Tab; label: string }[] = [
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'bitacora',   label: 'Bitácora' },
  { value: 'seguridad',  label: 'Seguridad' },
  { value: 'auditoria',  label: 'Auditoría' },
]

export default function SeguimientoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { obra, loading, error } = useObra(id!)
  const [tab, setTab] = useState<Tab>('pendientes')

  // Pendientes
  const [showPendienteForm, setShowPendienteForm] = useState(false)
  const { pendientes, loading: loadingP, createPendiente, toggleEstado, updatePendiente, deletePendiente } = usePendientes(id!)

  // Bitácora
  const { entradas, loading: loadingB, createEntrada, updateEntrada, deleteEntrada } = useBitacora(id!)
  const [bitacoraTexto, setBitacoraTexto] = useState('')
  const [savingBitacora, setSavingBitacora] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Seguridad
  const [showChecklistForm, setShowChecklistForm] = useState(false)
  const { checklists, loading: loadingC, createChecklist, deleteChecklist } = useChecklist(id!)

  // Auditorías
  const [showAuditoriaForm, setShowAuditoriaForm] = useState(false)
  const { auditorias, loading: loadingA, createAuditoria, deleteAuditoria } = useAuditorias(id!)

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  async function handleGuardarBitacora() {
    if (!bitacoraTexto.trim()) return
    setSavingBitacora(true)
    try {
      let foto_url: string | null = null

      if (fotoFile) {
        const ext = fotoFile.name.split('.').pop()
        const path = `bitacora/${id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(path, fotoFile, { upsert: true })
        if (!uploadError) {
          const { data } = supabase.storage.from('documentos').getPublicUrl(path)
          foto_url = data.publicUrl
        }
      }

      await createEntrada({
        obra_id:  id!,
        contenido: bitacoraTexto.trim(),
        foto_url,
        fecha: new Date().toISOString(),
      })
      setBitacoraTexto('')
      setFotoFile(null)
      setFotoPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setSavingBitacora(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Cargando...</div>
  )
  if (error || !obra) return (
    <div className="flex items-center justify-center py-20 text-red-500 text-sm">No se pudo cargar.</div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => navigate('/seguimiento')} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Seguimiento
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

      {/* ── PENDIENTES ── */}
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
                onUpdate={updatePendiente}
              />
            ))
          )}
        </div>
      )}

      {/* ── BITÁCORA ── */}
      {tab === 'bitacora' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <textarea
              value={bitacoraTexto}
              onChange={e => setBitacoraTexto(e.target.value)}
              placeholder="Escribe una entrada de bitácora..."
              rows={3}
              className="w-full text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
            />

            {/* Preview foto */}
            {fotoPreview && (
              <div className="relative">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="rounded-lg w-full object-cover max-h-48"
                />
                <button
                  onClick={() => { setFotoPreview(null); setFotoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-sm"
                >
                  ×
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              {/* Botón adjuntar foto */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="bitacora-foto-camara"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                  id="bitacora-foto-galeria"
                />
                <label
                  htmlFor="bitacora-foto-camara"
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  📷 Cámara
                </label>
                <label
                  htmlFor="bitacora-foto-galeria"
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  🖼 Galería
                </label>
              </div>
              <button
                disabled={!bitacoraTexto.trim() || savingBitacora}
                onClick={handleGuardarBitacora}
                className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
              >
                {savingBitacora ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          {loadingB ? (
            <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
          ) : entradas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No hay entradas en la bitácora.</p>
          ) : (
            entradas.map(e => (
              <BitacoraCard
                key={e.id}
                entrada={e}
                onDelete={deleteEntrada}
                onUpdate={updateEntrada}
              />
            ))
          )}
        </div>
      )}

      {/* ── SEGURIDAD ── */}
      {tab === 'seguridad' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">{checklists.length} inspecciones registradas</p>
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
              <ChecklistResumen key={c.id} checklist={c} onDelete={deleteChecklist} />
            ))
          )}
        </div>
      )}

      {/* ── AUDITORÍA ── */}
      {tab === 'auditoria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">{auditorias.length} auditorías registradas</p>
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
              <AuditoriaResumen key={a.id} auditoria={a} onDelete={deleteAuditoria} />
            ))
          )}
        </div>
      )}
    </div>
  )
}