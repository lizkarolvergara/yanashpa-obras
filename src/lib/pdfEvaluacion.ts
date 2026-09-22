type Tono = 'ok' | 'alerta' | 'neutro'

interface Item {
  label: string
  valor: string
  tono: Tono
}

interface Seccion {
  titulo?: string
  items: Item[]
}

interface Opciones {
  titulo: string
  fecha: string
  meta?: string[]
  observaciones?: string | null
  secciones: Seccion[]
  nombreArchivo: string
}

const TONOS: Record<Tono, [number, number, number]> = {
  ok:     [22, 163, 74],
  alerta: [180, 120, 0],
  neutro: [120, 120, 120],
}

export async function generarPdfEvaluacion(opciones: Opciones) {
  const { titulo, fecha, meta = [], observaciones, secciones, nombreArchivo } = opciones

  // Importación dinámica para no cargar jsPDF en el bundle inicial
  const jsPDF = (await import('jspdf')).default
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const margin = 15
  const contentW = pageW - margin * 2
  let y = 20

  function saltoPagina(alto: number) {
    if (y + alto > 275) {
      doc.addPage()
      y = 20
    }
  }

  // Título
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0)
  doc.text(titulo, margin, y)
  y += 8

  // Metadata
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)
  doc.text(`Fecha: ${fecha}`, margin, y)
  y += 6

  for (const linea of meta) {
    doc.text(linea, margin, y)
    y += 6
  }

  if (observaciones) {
    const lineas = doc.splitTextToSize(`Observaciones: ${observaciones}`, contentW)
    doc.text(lineas, margin, y)
    y += lineas.length * 5 + 2
  }

  y += 4
  doc.setDrawColor(200)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  // Secciones e ítems
  for (const seccion of secciones) {
    if (seccion.titulo) {
      saltoPagina(14)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0)
      doc.text(seccion.titulo, margin, y)
      y += 8
    }

    for (const item of seccion.items) {
      saltoPagina(10)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60)

      const etiqueta = doc.splitTextToSize(item.label, contentW - 38)
      doc.text(etiqueta, margin, y)

      doc.setFont('helvetica', 'bold')
      const [r, g, b] = TONOS[item.tono]
      doc.setTextColor(r, g, b)
      doc.text(item.valor, pageW - margin, y, { align: 'right' })

      y += Math.max(etiqueta.length * 5, 6)
      doc.setDrawColor(230)
      doc.line(margin, y - 2, pageW - margin, y - 2)
      y += 2
    }

    y += 3
  }

  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}