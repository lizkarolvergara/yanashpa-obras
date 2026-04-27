import { useState, useRef } from 'react'
import type { Documento } from '../../types'

interface Props {
  obraId: string
  onSave: (
    file: File,
    meta: { nombre: string; categoria: Documento['categoria']; descripcion: string; version: string }
  ) => Promise<void>
  onCancel: () => void
}

export default function FileUploader({ onSave, onCancel }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [meta, setMeta] = useState({
    nombre: '',
    categoria: 'contrato' as Documento['categoria'],
    descripcion: '',
    version: '',
  })
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    if (!meta.nombre) setMeta(prev => ({ ...prev, nombre: f.name.replace(/\.[^.]+$/, '') }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setMeta(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit() {
    if (!file) return
    setSaving(true)
    try {
      await onSave(file, meta)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-medium text-gray-900">Subir documento</h2>
      </div>

      <div className="p-5 space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFile(f)
          }}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-teal-300'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {file ? (
            <div>
              <p className="text-sm font-medium text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500">Arrastra un archivo aquí</p>
              <p className="text-xs text-gray-400 mt-1">o haz clic para seleccionar</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Nombre del documento</label>
            <input
              name="nombre"
              value={meta.nombre}
              onChange={handleChange}
              placeholder="Ej: Contrato principal"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoría</label>
            <select
              name="categoria"
              value={meta.categoria}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            >
              <option value="contrato">Contrato</option>
              <option value="anexo">Anexo</option>
              <option value="informe">Informe</option>
              <option value="plano">Plano</option>
              <option value="foto">Foto</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Versión</label>
            <input
              name="version"
              value={meta.version}
              onChange={handleChange}
              placeholder="Ej: 1.0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Descripción</label>
            <input
              name="descripcion"
              value={meta.descripcion}
              onChange={handleChange}
              placeholder="Descripción breve (opcional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || saving}
            className="flex-1 bg-teal-600 text-white text-sm py-2.5 rounded-lg hover:bg-teal-700 disabled:opacity-40 transition-colors"
          >
            {saving ? 'Subiendo...' : 'Subir archivo'}
          </button>
        </div>
      </div>
    </div>
  )
}