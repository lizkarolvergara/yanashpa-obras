# Yanashpa Proyectos — Contexto de desarrollo
**Para continuar en un nuevo chat**
**Fecha:** Mayo 2026

---

## 1. Descripción del proyecto

Aplicación web responsive (PWA) para supervisión y control de proyectos contratados a terceros en la empresa **Mundo Yanashpa** (Perú). La usa principalmente el supervisor de obras para gestionar en campo y oficina los alcances contractuales, documentación, pendientes, notas, checklists, bitácora y recorridos de cada proyecto.

**URL de producción:** Desplegada en Vercel  
**Repositorio:** GitHub — `lizkarolvergara/yanashpa-obras`  
**Base de datos:** Supabase (PostgreSQL)  
**Storage:** Supabase Storage (bucket: `documentos`, público)

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript |
| Build tool | Vite 8 |
| Estilos | Tailwind CSS 4 |
| Routing | React Router DOM |
| Backend / DB | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| PDF | jspdf (importación dinámica) |
| PWA | vite-plugin-pwa (con .npmrc legacy-peer-deps=true) |
| Deploy | Vercel |

---

## 3. Variables de entorno

En `.env.local` (local) y en Vercel (producción):
```
VITE_SUPABASE_URL=https://qhjcrzsbyoluqgsxcuie.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## 4. Estructura de carpetas actual

```
yanashpa-obras/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .env.local                             ← NO subir a git
├── .npmrc                                 ← legacy-peer-deps=true
├── public/
│   ├── icon-192.png
│   └── icon-512.png
└── src/
    ├── main.tsx
    ├── App.tsx                            ← router principal
    ├── index.css
    ├── lib/
    │   ├── supabase.ts                    ← cliente Supabase
    │   └── storage.ts                     ← upload/delete archivos
    ├── types/
    │   └── index.ts                       ← interfaces TypeScript
    ├── hooks/
    │   ├── useObras.ts
    │   ├── useObra.ts
    │   ├── useDocumentos.ts
    │   ├── usePendientes.ts
    │   ├── useNotas.ts
    │   ├── useChecklist.ts
    │   ├── useAuditorias.ts
    │   ├── useContactos.ts
    │   ├── useBitacora.ts                 ← entradas de bitácora por obra
    │   ├── useRecorridos.ts               ← CRUD recorridos de campo
    │   └── useObservaciones.ts            ← CRUD observaciones por recorrido
    ├── pages/
    │   ├── obras/
    │   │   ├── ObrasPage.tsx
    │   │   ├── ObraDetallePage.tsx
    │   │   └── ObraFormPage.tsx
    │   ├── seguimiento/
    │   │   ├── SeguimientoPage.tsx
    │   │   └── SeguimientoDetallePage.tsx
    │   ├── recorridos/
    │   │   ├── RecorridosPage.tsx
    │   │   └── RecorridoDetallePage.tsx
    │   └── informes/
    │       └── InformesPage.tsx           ← placeholder vacío
    └── components/
        ├── layout/
        │   └── AppLayout.tsx
        ├── obras/
        │   ├── ObraCard.tsx
        │   └── EstadoBadge.tsx
        ├── documentos/
        │   ├── DocumentoItem.tsx
        │   └── FileUploader.tsx
        ├── campo/
        │   ├── PendienteItem.tsx
        │   ├── PendienteForm.tsx
        │   └── NotaCard.tsx
        ├── seguridad/
        │   ├── ChecklistForm.tsx
        │   ├── ChecklistResumen.tsx
        │   ├── AuditoriaForm.tsx
        │   └── AuditoriaResumen.tsx
        ├── bitacora/
        │   └── BitacoraCard.tsx
        ├── recorridos/
        │   └── ObservacionItem.tsx
        └── ui/                            ← vacío, listo para componentes genéricos
```

---

## 5. Rutas de la aplicación

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | — | Redirige a `/proyectos` |
| `/proyectos` | ObrasPage | Lista de proyectos |
| `/proyectos/nuevo` | ObraFormPage | Crear proyecto |
| `/proyectos/:id` | ObraDetallePage | Detalle con pestañas |
| `/proyectos/:id/editar` | ObraFormPage | Editar proyecto |
| `/seguimiento` | SeguimientoPage | Lista de obras para seguimiento |
| `/seguimiento/:id` | SeguimientoDetallePage | Pendientes, Bitácora, Seguridad, Auditoría |
| `/recorridos` | RecorridosPage | Lista de recorridos de campo |
| `/recorridos/:id` | RecorridoDetallePage | Detalle + observaciones + PDF |
| `/informes` | InformesPage | Placeholder (módulo futuro) |

---

## 6. Base de datos (Supabase)

### Tabla: `obras`
```sql
id uuid PK
nombre text NOT NULL                      ← nombre contractual completo
nombre_corto text                         ← alias interno (ej: "Mantenimiento techo CH")
contratista text NOT NULL
tipo text CHECK (tipo IN ('obra_civil','mantenimiento','jardineria','carpinteria'))
monto decimal(12,2)
fecha_inicio date NOT NULL
fecha_fin date NOT NULL
estado text DEFAULT 'activa' CHECK (estado IN ('activa','pausada','cerrada'))
ubicacion text
descripcion text
ruc text
created_at timestamp DEFAULT now()
```

### Tabla: `documentos`
```sql
id uuid PK
obra_id uuid FK → obras(id) ON DELETE CASCADE
nombre text NOT NULL
categoria text CHECK (categoria IN ('contrato','anexo','informe','plano','foto','otro'))
archivo_url text NOT NULL
descripcion text
version text
created_at timestamp DEFAULT now()
```

### Tabla: `pendientes`
```sql
id uuid PK
obra_id uuid FK → obras(id) ON DELETE CASCADE
descripcion text NOT NULL
estado text DEFAULT 'abierto' CHECK (estado IN ('abierto','resuelto'))
fecha_limite date
responsable text
prioridad text DEFAULT 'media' CHECK (prioridad IN ('alta','media','baja'))
created_at timestamp DEFAULT now()
```

### Tabla: `notas_campo`
```sql
id uuid PK
obra_id uuid FK → obras(id) ON DELETE CASCADE
contenido text NOT NULL
foto_url text
fecha timestamp DEFAULT now()
```

### Tabla: `bitacora`
```sql
id uuid PK
obra_id uuid FK → obras(id) ON DELETE CASCADE
contenido text NOT NULL
foto_url text
fecha timestamp DEFAULT now()
```

### Tabla: `checklists`
```sql
id uuid PK
obra_id uuid FK → obras(id) ON DELETE CASCADE
fecha_inspeccion date DEFAULT current_date
respuestas jsonb DEFAULT '{}'             ← {key: 'ok'|'observado'|'na'}
estado_general text CHECK (estado_general IN ('ok','observado','critico'))
observaciones text
fotos_url text[]
created_at timestamp DEFAULT now()
```

### Tabla: `auditorias`
```sql
id uuid PK
obra_id uuid FK → obras(id) ON DELETE CASCADE
fecha_auditoria date DEFAULT current_date
respuestas jsonb DEFAULT '{}'             ← {key: 'cuenta'|'no_cuenta'}
estado_general text CHECK (estado_general IN ('ok','observado','critico'))
observaciones text
created_at timestamp DEFAULT now()
```

### Tabla: `contactos`
```sql
id uuid PK
obra_id uuid FK → obras(id) ON DELETE CASCADE
nombre text NOT NULL
cargo text
telefono text
email text
created_at timestamp DEFAULT now()
```

### Tabla: `recorridos`
```sql
id uuid PK
fecha date DEFAULT current_date
titulo text
participantes text
descripcion text
created_at timestamp DEFAULT now()
```

### Tabla: `observaciones_recorrido`
```sql
id uuid PK
recorrido_id uuid FK → recorridos(id) ON DELETE CASCADE
descripcion text NOT NULL
area_zona text
foto_url text                             ← primera foto (legacy, mantener)
fotos_url text[] DEFAULT '{}'            ← fotos adicionales
orden int DEFAULT 0
created_at timestamp DEFAULT now()
```

### Políticas RLS activas
Todas las tablas tienen RLS habilitado con política `allow all` (`true`) para fase MVP sin autenticación. El bucket `documentos` tiene políticas INSERT, SELECT y DELETE abiertas.

---

## 7. Tipos TypeScript (`src/types/index.ts`)

```ts
export interface Obra {
  id: string
  nombre: string
  nombre_corto: string | null
  contratista: string
  tipo: 'obra_civil' | 'mantenimiento' | 'jardineria' | 'carpinteria'
  monto: number | null
  fecha_inicio: string
  fecha_fin: string
  estado: 'activa' | 'pausada' | 'cerrada'
  ubicacion: string | null
  descripcion: string | null
  ruc: string | null
  created_at: string
}

export interface Contacto {
  id: string
  obra_id: string
  nombre: string
  cargo: string | null
  telefono: string | null
  email: string | null
  created_at: string
}

export interface Documento {
  id: string
  obra_id: string
  nombre: string
  categoria: 'contrato' | 'anexo' | 'informe' | 'plano' | 'foto' | 'otro'
  archivo_url: string
  descripcion: string | null
  version: string | null
  created_at: string
}

export interface Pendiente {
  id: string
  obra_id: string
  descripcion: string
  estado: 'abierto' | 'resuelto'
  fecha_limite: string | null
  responsable: string | null
  prioridad: 'alta' | 'media' | 'baja'
  created_at: string
}

export interface NotaCampo {
  id: string
  obra_id: string
  contenido: string
  foto_url: string | null
  fecha: string
}

export interface BitacoraEntry {
  id: string
  obra_id: string
  contenido: string
  foto_url: string | null
  fecha: string
}

export interface Checklist {
  id: string
  obra_id: string
  fecha_inspeccion: string
  respuestas: Record<string, 'ok' | 'observado' | 'na'>
  estado_general: 'ok' | 'observado' | 'critico'
  observaciones: string | null
  fotos_url: string[] | null
  created_at: string
}

export interface Auditoria {
  id: string
  obra_id: string
  fecha_auditoria: string
  respuestas: Record<string, 'cuenta' | 'no_cuenta'>
  estado_general: 'ok' | 'observado' | 'critico'
  observaciones: string | null
  created_at: string
}

export interface Recorrido {
  id: string
  fecha: string
  titulo: string | null
  participantes: string | null
  descripcion: string | null
  created_at: string
}

export interface ObservacionRecorrido {
  id: string
  recorrido_id: string
  descripcion: string
  area_zona: string | null
  foto_url: string | null
  fotos_url: string[] | null
  orden: number
  created_at: string
}
```

---

## 8. Módulos implementados

### Navbar
**Proyectos · Seguimiento · Recorridos · Informes**

---

### PROYECTOS (`/proyectos`)
Lista de obras en cards. Cada card muestra: nombre corto (o contractual si no hay), estado badge, contratista, fecha inicio, fecha fin, tipo, días restantes.

**ObraDetallePage — pestañas:**
| Pestaña | Funcionalidad |
|---------|--------------|
| Información | Datos contractuales + plazo en días calendarios calculado automáticamente. Muestra nombre corto + nombre contractual completo |
| Documentos | Subir archivos (drag & drop), Ver, Descargar. Editar (nombre, categoría, versión, descripción) con eliminar dentro de edición |
| Notas | Texto libre con fecha automática. Editar con eliminar dentro de edición |
| Contactos | Agregar/editar/eliminar contactos. Teléfono y correo con botón copiar (SVG Tabler). Editar con eliminar dentro |

**ObraFormPage:**
- Campo "Nombre conocido" (alias, opcional) + "Nombre contractual" (requerido)
- Fecha inicio + Plazo en días calendarios → autocompleta fecha fin. Los tres campos son reactivos entre sí
- `plazo_dias` es solo campo UI, no se persiste en BD

---

### SEGUIMIENTO (`/seguimiento`)
Lista de obras igual que Proyectos (mismas cards). Al abrir una obra:

**SeguimientoDetallePage — pestañas:**
| Pestaña | Funcionalidad |
|---------|--------------|
| Pendientes | Crear, toggle resuelto/abierto, editar (descripción, prioridad, fecha límite, responsable), eliminar dentro de edición |
| Bitácora | Texto libre + foto (cámara o galería). Editar con eliminar dentro de edición. Foto se sube a Supabase Storage |
| Seguridad | Checklist de 12 ítems (ok/observado/na), historial, eliminar con confirmación |
| Auditoría | Checklist de 6 secciones / 22 ítems (cuenta/no_cuenta), expandible, eliminar |

**Checklist de seguridad — 12 ítems:**
EPP correcto, Orden y limpieza, SCTR vigente, Equipos con certificado, Andamios seguros, Botiquín disponible, Extintores vigentes, Instalaciones eléctricas seguras, Vías de evacuación libres, Herramientas en buen estado, Señalización activa, Inducción de seguridad

**Auditoría — 6 secciones / 22 ítems:**
I. Requisitos documentales (4) · II. Personal clave (3) · III. Seguridad y salud (4) · IV. Orden y residuos (4) · V. Ejecución y calidad (3) · VI. Imagen y conducta (4)

---

### RECORRIDOS (`/recorridos`)
Lista de recorridos con fecha, título y participantes. Crear recorrido con fecha automática + título opcional + participantes + descripción.

**RecorridoDetallePage:**
- Editar título, participantes y descripción del recorrido
- Agregar observaciones: área/zona (opcional) + descripción + múltiples fotos (cámara o galería)
- Cada observación editable: descripción, área/zona, fotos (agregar más o eliminar existentes)
- Eliminar observación con confirmación
- Eliminar recorrido completo con confirmación
- **Exportar PDF:** genera PDF con título, fecha, participantes, descripción y lista numerada de observaciones con sus fotos. Fotos respetan proporciones originales escaladas (maxW=180mm, maxH=80mm)

**Fotos en observaciones:**
- `foto_url` — primera foto (campo legacy, se mantiene para compatibilidad)
- `fotos_url` — array de fotos adicionales
- Al editar: se combinan ambos en un array unificado, todas eliminables
- En vista normal: grid de 2 columnas si hay más de una foto

---

### INFORMES (`/informes`)
Placeholder vacío — módulo por implementar.

---

## 9. Convenciones del código

- Hooks con prefijo `use` en `/hooks/` — cada uno maneja una tabla
- Un hook por tabla, con `fetch`, `create`, `delete` (y `update`/`toggle` donde aplica)
- Páginas en `/pages/` — corresponden a rutas
- Componentes reutilizables en `/components/` — organizados por módulo
- `formatTipo()` definida como función fuera del componente en los archivos que la usan
- Confirmación de dos pasos para eliminar — el eliminar siempre vive dentro del modo edición (no directo)
- Tailwind CSS para todos los estilos, paleta principal `teal-600`
- Supabase retorna `data` y `error` — siempre verificar `error` antes de usar `data`
- `update` de documentos, notas, pendientes y contactos se hace con `supabase.from(...).update()` directo en `ObraDetallePage` (sin hook dedicado)
- `nombre_corto` es solo campo UI en `ObraFormPage` — se persiste en BD pero `plazo_dias` no

---

## 10. Pendiente por implementar

### 🟢 Fase 2 (futuro)
- Autenticación con roles (supervisor, gerencia, contratista)
- Row Level Security real en Supabase
- Módulo Informes
- Módulo de cronograma con avance vs. planificado
- Pendientes globales (sin obra asociada)
- Offline completo con IndexedDB + cola de sincronización
- Refetch automático en hooks de notas, documentos y pendientes (actualmente usan `window.dispatchEvent` como señal)

---

## 11. Cómo continuar en un nuevo chat

1. Comparte este documento al inicio del nuevo chat
2. Clona el repo: `git clone https://github.com/lizkarolvergara/yanashpa-obras.git`
3. Instala: `npm install --legacy-peer-deps`
4. Crea `.env.local` con las claves de Supabase
5. Corre: `npm run dev`

---

## 12. Prompt sugerido para el nuevo chat

> Estoy desarrollando una app web llamada **Yanashpa Proyectos** con React + TypeScript + Vite + Tailwind + Supabase. Te comparto el documento de contexto completo con la estructura actualizada, base de datos, tipos y módulos implementados. [adjunta este documento]