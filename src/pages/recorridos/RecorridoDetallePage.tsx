import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRecorridos } from '../../hooks/useRecorridos'
import { useObservaciones } from '../../hooks/useObservaciones'
import ObservacionItem from '../../components/recorridos/ObservacionItem'
import { supabase } from '../../lib/supabase'

export default function RecorridoDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { recorridos, updateRecorrido, deleteRecorrido } = useRecorridos()
  const recorrido = recorridos.find(r => r.id === id)
  const { observaciones, loading, createObservacion, updateObservacion, deleteObservacion } = useObservaciones(id!)

  const [editandoInfo, setEditandoInfo] = useState(false)
  const [editInfoForm, setEditInfoForm] = useState({ titulo: '', participantes: '', descripcion: '' })
  const [savingInfo, setSavingInfo] = useState(false)
  const [showObsForm, setShowObsForm] = useState(false)
  const [obsForm, setObsForm] = useState({ descripcion: '', area_zona: '' })
  const [fotosNuevas, setFotosNuevas] = useState<{ file: File; preview: string }[]>([])
  const [savingObs, setSavingObs] = useState(false)
  const fileInputCamaraRef = useRef<HTMLInputElement>(null)
  const fileInputGaleriaRef = useRef<HTMLInputElement>(null)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [generandoPDF, setGenerandoPDF] = useState(false)

  async function handleAgregarFotoNueva(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotosNuevas(prev => [...prev, { file, preview: URL.createObjectURL(file) }])
    // reset input para poder agregar la misma foto dos veces si se desea
    e.target.value = ''
  }

  function handleEliminarFotoNueva(index: number) {
    setFotosNuevas(prev => prev.filter((_, i) => i !== index))
  }

  async function handleGuardarObservacion() {
    if (!obsForm.descripcion.trim()) return
    setSavingObs(true)
    try {
      const urlsSubidas: string[] = []
      for (const { file } of fotosNuevas) {
        const ext = file.name.split('.').pop()
        const path = `recorridos/${id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(path, file, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(path)
          urlsSubidas.push(urlData.publicUrl)
        }
      }
      const [primeraFoto, ...restoFotos] = urlsSubidas
      await createObservacion({
        recorrido_id: id!,
        descripcion:  obsForm.descripcion.trim(),
        area_zona:    obsForm.area_zona.trim() || null,
        foto_url:     primeraFoto ?? null,
        fotos_url:    restoFotos,
        orden:        observaciones.length,
      })
      setObsForm({ descripcion: '', area_zona: '' })
      setFotosNuevas([])
      setShowObsForm(false)
    } finally {
      setSavingObs(false)
    }
  }

  async function handleGenerarPDF() {
    if (!recorrido) return
    setGenerandoPDF(true)
    try {
      // Importación dinámica para no bloquear el bundle inicial
      const jsPDF = (await import('jspdf')).default
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const margin = 15
      const contentW = pageW - margin * 2
      let y = 20

      // Título
      const titulo = recorrido.titulo ?? 'Recorrido de campo'
      const fechaStr = new Date(recorrido.fecha).toLocaleDateString('es-PE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })

      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(titulo, margin, y)
      y += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(fechaStr, margin, y)
      y += 6

      if (recorrido.participantes) {
        doc.text(`Participantes: ${recorrido.participantes}`, margin, y)
        y += 6
      }
      if (recorrido.descripcion) {
        doc.text(`Descripción: ${recorrido.descripcion}`, margin, y)
        y += 6
      }

      y += 4
      doc.setDrawColor(200)
      doc.line(margin, y, pageW - margin, y)
      y += 8

      doc.setTextColor(0)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Observaciones', margin, y)
      y += 8

      for (let i = 0; i < observaciones.length; i++) {
        const obs = observaciones[i]
        if (y > 260) { doc.addPage(); y = 20 }

        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0)
        doc.text(`${i + 1}.${obs.area_zona ? '  ' + obs.area_zona : ''}`, margin, y)
        y += 6

        doc.setFont('helvetica', 'normal')
        const lines = doc.splitTextToSize(obs.descripcion, contentW)
        doc.text(lines, margin, y)
        y += lines.length * 5 + 4

        // Fotos — todas las fotos de la observación respetando proporciones
        const todasFotos: string[] = [
          ...(obs.foto_url ? [obs.foto_url] : []),
          ...(obs.fotos_url ?? []),
        ]
        for (const fotoUrl of todasFotos) {
          try {
            const { imgData, width: imgW, height: imgH } = await fetchImageWithDimensions(fotoUrl)
            let drawW = imgW
            let drawH = imgH
            const maxW = contentW    // 180mm máximo ancho
            const maxH = 80          // 80mm máximo alto — aprox 1/3 de página
            // Escalar proporcionalmente hasta que entre en los límites
            const scaleW = drawW > maxW ? maxW / drawW : 1
            drawW = drawW * scaleW
            drawH = drawH * scaleW
            const scaleH = drawH > maxH ? maxH / drawH : 1
            drawW = drawW * scaleH
            drawH = drawH * scaleH
            if (y + drawH > 270) { doc.addPage(); y = 20 }
            doc.addImage(imgData, 'JPEG', margin, y, drawW, drawH)
            y += drawH + 4
          } catch {
            // si falla la imagen, continuar
          }
        }

        y += 4
      }

      const fileName = `Recorrido_${titulo.replace(/\s+/g, '_')}_${recorrido.fecha}.pdf`
      const blob = doc.output('blob')
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      a.click()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
    } finally {
      setGenerandoPDF(false)
    }
  }

  async function fetchImageWithDimensions(url: string): Promise<{ imgData: string; width: number; height: number }> {
    // Cargamos la imagen via canvas para evitar problemas CORS en producción
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth
          canvas.height = img.naturalHeight
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0)
          const imgData = canvas.toDataURL('image/jpeg', 0.85)
          resolve({ imgData, width: img.naturalWidth, height: img.naturalHeight })
        } catch {
          // Si canvas falla (tainted), intentar con fetch directo
          fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY } })
            .then(r => r.blob())
            .then(blob => new Promise<string>((res, rej) => {
              const reader = new FileReader()
              reader.onload = () => res(reader.result as string)
              reader.onerror = rej
              reader.readAsDataURL(blob)
            }))
            .then(imgData => {
              const i = new Image()
              i.onload = () => resolve({ imgData, width: i.naturalWidth, height: i.naturalHeight })
              i.src = imgData
            })
            .catch(reject)
        }
      }
      img.onerror = () => {
        // Si crossOrigin falla, intentar sin él
        const img2 = new Image()
        img2.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img2.naturalWidth
          canvas.height = img2.naturalHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject(new Error('no canvas'))
          try {
            ctx.drawImage(img2, 0, 0)
            const imgData = canvas.toDataURL('image/jpeg', 0.85)
            resolve({ imgData, width: img2.naturalWidth, height: img2.naturalHeight })
          } catch {
            reject(new Error('tainted canvas'))
          }
        }
        img2.onerror = reject
        img2.src = url
      }
      img.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now()
    })
  }

  if (!recorrido) return (
    <div className="flex items-center justify-center py-20 text-gray-400 text-sm">Cargando...</div>
  )

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => navigate('/recorridos')} className="text-gray-400 hover:text-gray-600 text-sm">
          ← Recorridos
        </button>
      </div>

      <div className="mb-4 mt-3">
        {editandoInfo ? (
          <div className="bg-white border border-teal-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Editar recorrido</p>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Título</label>
              <input
                value={editInfoForm.titulo}
                onChange={e => setEditInfoForm(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ej: Recorrido semanal zona norte"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Participantes</label>
              <input
                value={editInfoForm.participantes}
                onChange={e => setEditInfoForm(prev => ({ ...prev, participantes: e.target.value }))}
                placeholder="Ej: Liz, Juan, contratista ABC"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Descripción general</label>
              <textarea
                value={editInfoForm.descripcion}
                onChange={e => setEditInfoForm(prev => ({ ...prev, descripcion: e.target.value }))}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditandoInfo(false)}
                className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={savingInfo}
                onClick={async () => {
                  setSavingInfo(true)
                  await updateRecorrido(id!, {
                    titulo:        editInfoForm.titulo.trim() || null,
                    participantes: editInfoForm.participantes.trim() || null,
                    descripcion:   editInfoForm.descripcion.trim() || null,
                  })
                  setSavingInfo(false)
                  setEditandoInfo(false)
                }}
                className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {savingInfo ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-medium text-gray-900 mb-1">
                {recorrido.titulo ?? 'Recorrido sin título'}
              </h1>
              <p className="text-sm text-gray-400">
                {new Date(recorrido.fecha).toLocaleDateString('es-PE', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
              {recorrido.participantes && (
                <p className="text-sm text-gray-500 mt-1">{recorrido.participantes}</p>
              )}
              {recorrido.descripcion && (
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{recorrido.descripcion}</p>
              )}
            </div>
            <button
              onClick={() => {
                setEditInfoForm({
                  titulo:        recorrido.titulo ?? '',
                  participantes: recorrido.participantes ?? '',
                  descripcion:   recorrido.descripcion ?? '',
                })
                setEditandoInfo(true)
              }}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex-shrink-0 transition-colors"
            >
              Editar
            </button>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 mb-6 mt-4">
        <button
          onClick={handleGenerarPDF}
          disabled={generandoPDF || observaciones.length === 0}
          className="text-sm px-4 py-2 rounded-lg border border-teal-200 text-teal-600 hover:bg-teal-50 disabled:opacity-40 transition-colors"
        >
          {generandoPDF ? 'Generando...' : '↓ Exportar PDF'}
        </button>
        <button
          onClick={() => setConfirmandoEliminar(true)}
          className="text-sm px-4 py-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
        >
          Eliminar recorrido
        </button>
      </div>

      {confirmandoEliminar && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
          <span className="text-sm text-red-600 flex-1">¿Eliminar este recorrido y todas sus observaciones?</span>
          <button
            onClick={async () => { await deleteRecorrido(id!); navigate('/recorridos') }}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Sí, eliminar
          </button>
          <button
            onClick={() => setConfirmandoEliminar(false)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            No
          </button>
        </div>
      )}

      {/* Lista observaciones */}
      <div className="space-y-3 mb-4">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>
        ) : observaciones.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No hay observaciones. Agrega la primera.</p>
        ) : (
          observaciones.map((obs, i) => (
            <ObservacionItem
              key={obs.id}
              observacion={obs}
              numero={i + 1}
              onDelete={deleteObservacion}
              onUpdate={updateObservacion}
            />
          ))
        )}
      </div>

      {/* Formulario nueva observación */}
      {showObsForm ? (
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Nueva observación</p>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Área / Zona (opcional)</label>
            <input
              value={obsForm.area_zona}
              onChange={e => setObsForm(prev => ({ ...prev, area_zona: e.target.value }))}
              placeholder="Ej: Piscina, Área verde, Fachada..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Descripción *</label>
            <textarea
              value={obsForm.descripcion}
              onChange={e => setObsForm(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              placeholder="Describe la observación..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-teal-400"
            />
          </div>

          {/* Previews de fotos agregadas */}
          {fotosNuevas.length > 0 && (
            <div className="space-y-2">
              {fotosNuevas.map((f, i) => (
                <div key={i} className="relative">
                  <img src={f.preview} alt={`Foto ${i + 1}`} className="rounded-lg w-full object-cover max-h-48" />
                  <button
                    onClick={() => handleEliminarFotoNueva(i)}
                    className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <input ref={fileInputCamaraRef} type="file" accept="image/*" capture="environment" onChange={handleAgregarFotoNueva} className="hidden" />
            <input ref={fileInputGaleriaRef} type="file" accept="image/*" onChange={handleAgregarFotoNueva} className="hidden" />
            <button
              onClick={() => fileInputCamaraRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              📷 Cámara
            </button>
            <button
              onClick={() => fileInputGaleriaRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              🖼 Galería
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowObsForm(false); setObsForm({ descripcion: '', area_zona: '' }); setFotosNuevas([]) }}
              className="flex-1 border border-gray-200 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardarObservacion}
              disabled={savingObs || !obsForm.descripcion.trim()}
              className="flex-1 bg-teal-600 text-white text-sm py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {savingObs ? 'Guardando...' : 'Agregar observación'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowObsForm(true)}
          className="w-full border-2 border-dashed border-gray-200 text-gray-400 hover:border-teal-300 hover:text-teal-600 text-sm py-4 rounded-xl transition-colors"
        >
          + Agregar observación
        </button>
      )}
    </div>
  )
}
