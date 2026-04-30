import { useState } from 'react'
import type { Auditoria } from '../../types'

interface Props {
  auditoria: Auditoria
  onDelete: (id: string) => void
}

const ITEMS: Record<string, string> = {
  cronograma_presentado: 'Cronograma de obra presentado',
  cronograma_impreso:    'Cronograma de obra impreso y visible en obra',
  iperc_elaborado:       'Matriz de Seguridad / IPERC elaborada',
  iperc_impreso:         'Matriz IPERC impresa y visible en obra',
  residente:             'Residente de obra designado (Ing./Arq. ≥ 2 años)',
  prevencionista:        'Prevencionista de riesgos designado',
  personal:              'Personal suficiente y calificado en obra',
  epp_uso:               'Uso permanente de EPP completo',
  epp_estado:            'EPP en buen estado',
  sctr:                  'SCTR vigente (si aplica)',
  induccion:             'Inducción de seguridad al personal',
  contenedor:            'Contenedor para residuos instalado',
  desperdicios:          'Manejo adecuado de desperdicios y desmontes',
  limpieza:              'Área de trabajo limpia y ordenada',
  materiales:            'Materiales correctamente almacenados',
  alcance:               'Trabajos conforme al alcance contractual',
  cronograma:            'Cumplimiento del cronograma aprobado',
  calidad:               'Calidad técnica y buena práctica constructiva',
  uniforme:              'Personal uniformado con logo del contratista',
  logos:                 'No uso de logos de otros proyectos',
  conducta:              'Conducta adecuada y respeto al proyecto',
  confidencialidad:      'Cumplimiento de confidencialidad',
}

const SECCIONES = [
  { titulo: 'I. Requisitos documentales y previos', keys: ['cronograma_presentado', 'cronograma_impreso', 'iperc_elaborado', 'iperc_impreso'] },
  { titulo: 'II. Personal clave', keys: ['residente', 'prevencionista', 'personal'] },
  { titulo: 'III. Seguridad y salud en el trabajo', keys: ['epp_uso', 'epp_estado', 'sctr', 'induccion'] },
  { titulo: 'IV. Orden, medio ambiente y residuos', keys: ['contenedor', 'desperdicios', 'limpieza', 'materiales'] },
  { titulo: 'V. Ejecución, calidad y plazos', keys: ['alcance', 'cronograma', 'calidad'] },
  { titulo: 'VI. Imagen, conducta y confidencialidad', keys: ['uniforme', 'logos', 'conducta', 'confidencialidad'] },
]

const estadoConfig = {
  ok:       { label: 'Conforme',  className: 'bg-teal-50 text-teal-700' },
  observado:{ label: 'Observado', className: 'bg-amber-50 text-amber-700' },
  critico:  { label: 'Crítico',   className: 'bg-red-50 text-red-600' },
}

export default function AuditoriaResumen({ auditoria, onDelete }: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const [expandido, setExpandido] = useState(false)
  const estado = estadoConfig[auditoria.estado_general]
  const fecha = new Date(auditoria.fecha_auditoria).toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const noCuenta = Object.values(auditoria.respuestas).filter(v => v === 'no_cuenta').length
  const cuenta = Object.values(auditoria.respuestas).filter(v => v === 'cuenta').length

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 capitalize">{fecha}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {cuenta} conformes · {noCuenta} no conformes
          </p>
          {auditoria.observaciones && (
            <p className="text-xs text-gray-400 mt-0.5">{auditoria.observaciones}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${estado.className}`}>
            {estado.label}
          </span>
          <button
            onClick={() => setExpandido(!expandido)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            {expandido ? 'Ocultar' : 'Ver detalle'}
          </button>
          {confirmando ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(auditoria.id)}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
              <button
                onClick={() => setConfirmando(false)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmando(true)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {expandido && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {SECCIONES.map(seccion => (
            <div key={seccion.titulo}>
              <div className="px-5 py-2 bg-gray-50">
                <p className="text-xs font-medium text-gray-500">{seccion.titulo}</p>
              </div>
              {seccion.keys.map(key => (
                <div key={key} className="flex items-center justify-between px-5 py-2.5">
                  <p className="text-sm text-gray-600">{ITEMS[key] ?? key}</p>
                  <span className={`text-xs font-medium ${
                    auditoria.respuestas[key] === 'cuenta' ? 'text-teal-600' : 'text-red-500'
                  }`}>
                    {auditoria.respuestas[key] === 'cuenta' ? 'Cuenta' : 'No cuenta'}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}