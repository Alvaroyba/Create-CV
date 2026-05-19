# Headless CV

Editor de currículum que separa estrictamente el **contenido** (datos estructurados) de la **presentación** (plantillas renderizadas en servidor), garantizando PDFs pixel-perfect independientemente del dispositivo o navegador.

Sin registro. Sin cuentas. Los datos se guardan en `localStorage`.

## Características

- **Formularios estructurados** — Edita todas las secciones de tu CV en formato [JSON Resume](https://jsonresume.org/): experiencia, educación, habilidades, proyectos, idiomas, certificaciones y más.
- **Toggles por sección y entrada** — Activa o desactiva secciones y entradas individuales sin borrarlas, para adaptar el CV a cada oferta.
- **Generación de PDF server-side** — Renderizado con Puppeteer sobre una plantilla HTML/CSS fija. El resultado es siempre consistente.
- **Importación / Exportación JSON** — Importa y exporta tu CV en formato JSON Resume estándar.
- **Autorelleno con IA** — Sube un PDF de tu CV existente y usa OpenAI, Anthropic, Gemini u Ollama para extraer los datos automáticamente.
- **Persistencia local** — Todo se guarda en `localStorage`, sin backend de datos.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Validación | Zod |
| PDF generación | Puppeteer |
| PDF extracción | pdfjs-dist |
| Sanitización | isomorphic-dompurify |
| Lenguaje | TypeScript |

## Instalación

\`\`\`bash
pnpm install
\`\`\`

## Desarrollo

\`\`\`bash
pnpm dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000).

## Build de producción

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## Variables de entorno

El proyecto no requiere variables de entorno para funcionar. Las claves de API para IA se introducen directamente en la interfaz y nunca se envían al servidor de forma persistente.

Si usas Ollama con una URL personalizada, puedes configurarla:

\`\`\`env
OLLAMA_BASE_URL=http://localhost:11434
\`\`\`

## Estructura del proyecto

\`\`\`
src/
├── app/
│   ├── page.tsx              # Landing / inicio
│   ├── editor/page.tsx       # Editor principal
│   └── api/
│       ├── generate-pdf/     # Endpoint de generación de PDF
│       ├── parse-cv/         # Endpoint de extracción IA
│       └── verify-key/       # Verificación de clave API
├── components/
│   ├── forms/                # Formularios por sección
│   ├── import-export/        # Diálogos de importación y exportación
│   ├── preview/              # Vista previa del CV
│   └── ui/                   # Componentes base
├── hooks/                    # Lógica de estado y efectos
├── lib/                      # Utilidades, schemas, lógica PDF e IA
└── providers/                # Contexto global del CV
\`\`\`
