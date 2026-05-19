# Feature: F-03 — Renderizado y Descarga de PDF Server-Side

## Problema de Negocio

La generación de PDF mediante el diálogo de impresión del navegador (`window.print()`) produce resultados inconsistentes: fuentes diferentes entre navegadores, márgenes impredecibles, saltos de página que cortan contenido a la mitad y variaciones entre sistemas operativos. Esto contradice directamente la promesa de valor del producto (inmutabilidad estética). Un motor de renderizado server-side con Puppeteer/Playwright garantiza que el PDF generado sea idéntico byte a byte independientemente del dispositivo, navegador o sistema operativo del usuario.

## Usuario Objetivo

- **Rol:** Profesional que necesita descargar su CV en formato PDF para enviarlo a reclutadores, subirlo a portales de empleo o imprimirlo.
- **Contexto de uso:** Mobile o desktop. Momento crítico: justo antes de enviar una candidatura. Tolerancia baja a errores o demoras.

## Flujo Principal (Happy Path)

1. El usuario ha completado su CV con al menos los datos obligatorios (nombre, contacto, 1 sección con contenido activo).
2. El usuario presiona el botón "Descargar PDF" (visible de forma prominente en la interfaz).
3. El sistema valida en cliente que los datos cumplen los requisitos mínimos (validación Zod).
4. El sistema envía el payload JSON al endpoint de generación de PDF en el servidor.
5. El servidor valida el esquema de datos recibido.
6. El servidor inyecta los datos (solo entradas con `isActive: true`) en la plantilla HTML/CSS seleccionada.
7. Una instancia headless de Puppeteer/Playwright renderiza el HTML en un viewport de dimensiones A4 (210mm x 297mm) con estilos `@media print` aplicados.
8. El motor ejecuta `page.pdf()` con configuración determinista (márgenes fijos, sin encabezados/pies de navegador).
9. Si el usuario configuró "limitar a 1 página", el motor verifica la altura del contenido renderizado y aplica la estrategia correspondiente.
10. El servidor retorna el binario PDF al cliente.
11. El navegador inicia la descarga automática del archivo con nombre `CV_[Nombre]_[YYYY-MM-DD].pdf`.
12. El usuario ve una confirmación: "Tu CV se ha descargado correctamente."

## Flujos Alternativos

- Si el usuario tiene configurado "multi-página" y el contenido excede una página A4 → el motor genera un PDF de múltiples páginas con saltos de bloque limpios (`break-inside: avoid` en cada entrada). El usuario recibe el PDF completo.
- Si el usuario tiene configurado "limitar a 1 página" y el contenido excede → se muestra un aviso antes de la generación: "Tu CV excede 1 página. Desactiva algunas entradas o reduce el contenido para ajustarlo." No se genera el PDF hasta que el contenido quepa.
- Si el usuario desea ver una vista previa del PDF antes de descargar → en desktop, la vista previa en tiempo real simula el resultado final. En mobile, el botón "Ver preview" muestra una representación HTML del CV en un modal a pantalla completa.

## Reglas de Negocio

- El PDF se genera exclusivamente en el servidor (nunca en el navegador del cliente).
- La plantilla HTML/CSS utilizada para el renderizado tiene estilos fijos e inmutables: tamaños de fuente, interlineado, márgenes de página y padding están definidos como tokens de diseño constantes.
- Los márgenes del PDF son: superior 15mm, inferior 15mm, izquierdo 15mm, derecho 15mm (configurable a nivel de plantilla, no a nivel de usuario).
- El formato de página por defecto es A4 (210mm x 297mm). Se contempla soporte para Letter (215.9mm x 279.4mm) como opción futura.
- El contenido Markdown de los campos se convierte a HTML antes de la inyección en la plantilla.
- Se aplica `break-inside: avoid` a nivel de cada entrada (cada experiencia laboral, cada educación, etc.) para evitar cortes a la mitad.
- Se aplica `break-before: auto` a nivel de sección para permitir saltos limpios entre secciones.
- El nombre del archivo descargado sigue el patrón: `CV_[Nombre_Apellido]_[YYYY-MM-DD].pdf` (caracteres especiales reemplazados por guiones bajos).
- El tiempo máximo de generación (timeout) es de 30 segundos. Si se excede, se retorna error.
- El tamaño máximo del payload JSON aceptado es de 1 MB.
- El PDF generado no debe exceder 5 MB de tamaño.

## Casos de Error (desde la perspectiva del usuario)

- Si el usuario presiona "Descargar PDF" sin cumplir los requisitos mínimos de datos → se muestra mensaje: "Completa al menos tu nombre, un dato de contacto y una entrada en alguna sección antes de descargar."
- Si la validación del esquema en el servidor falla → se muestra mensaje: "Los datos del CV contienen un formato inesperado. Intenta recargar la página y volver a descargar."
- Si el servidor no responde o hay un error de red → se muestra mensaje: "No se pudo conectar con el servidor de generación de PDF. Verifica tu conexión a internet e intenta de nuevo."
- Si el timeout de 30 segundos se excede → se muestra mensaje: "La generación del PDF está tardando más de lo esperado. Intenta reducir el contenido del CV o inténtalo más tarde."
- Si el motor de renderizado falla internamente → se muestra mensaje genérico: "Ocurrió un error al generar tu PDF. Nuestro equipo ha sido notificado. Por favor, intenta de nuevo en unos minutos."
- Si el usuario tiene configurado "1 página" pero el contenido excede → se muestra mensaje preventivo (antes de llamar al servidor): "Tu contenido activo excede el espacio de 1 página. Desactiva algunas entradas o edita el contenido para ajustarlo."

## Datos Involucrados

### Datos de entrada

- Payload JSON completo del CV (solo entradas con `isActive: true`), validado contra esquema Zod.
- Configuración de paginación: "multi-página" o "1 página" (booleano).
- Identificador de plantilla seleccionada (string, por defecto "default").

### Datos de salida

- Archivo binario PDF (application/pdf).
- Nombre de archivo: `CV_[Nombre]_[YYYY-MM-DD].pdf`.
- Código HTTP de respuesta (200 éxito, 4xx error de datos, 5xx error de servidor).

## APIs Disponibles

### Servicio: PDF Generation

- **Endpoint:** `POST /api/generate-pdf`
- **Descripción:** Recibe los datos del CV en formato JSON y retorna un archivo PDF generado mediante Puppeteer/Playwright en el servidor.

#### Request

```json
{
  "cvData": {
    "basics": { "..." : "..." },
    "work": [ "..." ],
    "education": [ "..." ],
    "skills": [ "..." ],
    "languages": [ "..." ],
    "projects": [ "..." ],
    "certifications": [ "..." ],
    "volunteer": [ "..." ],
    "publications": [ "..." ]
  },
  "options": {
    "templateId": "default",
    "singlePage": false,
    "pageSize": "A4"
  }
}
```

#### Response (éxito)

Binary PDF con headers:

- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="CV_Nombre_2026-05-18.pdf"`

#### Response (error)

```json
{
  "error": {
    "code": "VALIDATION_ERROR | RENDER_ERROR | TIMEOUT_ERROR | CONTENT_OVERFLOW",
    "message": "Descripción legible del error"
  }
}
```

#### Códigos de error

| Código | Tipo               | Descripción                                        |
| ------ | ------------------ | -------------------------------------------------- |
| 400    | VALIDATION_ERROR   | Datos de entrada inválidos                         |
| 409    | CONTENT_OVERFLOW   | Contenido excede 1 página cuando singlePage=true   |
| 500    | RENDER_ERROR       | Error interno del motor de renderizado              |
| 504    | TIMEOUT_ERROR      | Timeout de generación excedido (>30s)               |

## Mockups / Wireframes

No disponibles. El botón "Descargar PDF" debe ser visualmente prominente (color de acento, tamaño grande, icono de descarga). Se sugiere posición fija en la esquina inferior derecha (mobile) o en la barra superior de acciones (desktop).

## Fuera de Alcance

- NO incluye generación de PDF en el navegador del cliente (vía jsPDF, html2canvas u otros).
- NO incluye formato de página Letter (se deja para fase posterior).
- NO incluye personalización de márgenes por parte del usuario.
- NO incluye marca de agua o branding de la aplicación en el PDF generado.
- NO incluye protección con contraseña del PDF.
- NO incluye generación de enlaces públicos para compartir el PDF online.
- NO incluye caché de PDFs generados en el servidor.

## Criterios de Aceptación

- [ ] **CA-01:** El usuario puede descargar un PDF de su CV presionando el botón "Descargar PDF" y recibiendo un archivo con formato `CV_[Nombre]_[YYYY-MM-DD].pdf`.
- [ ] **CA-02:** El PDF generado es visualmente idéntico (pixel-perfect) independientemente del navegador (Chrome, Firefox, Safari) y sistema operativo (Windows, macOS, iOS, Android) desde el que se solicite.
- [ ] **CA-03:** El PDF solo incluye las entradas con `isActive: true` y omite por completo las desactivadas, sin espacios vacíos residuales.
- [ ] **CA-04:** Ninguna entrada de contenido (experiencia, educación, etc.) se corta a la mitad por un salto de página; los saltos de bloque son limpios.
- [ ] **CA-05:** Si el usuario configura "limitar a 1 página" y el contenido excede, se muestra un aviso preventivo y no se genera el PDF.
- [ ] **CA-06:** El tiempo de generación del PDF no excede 30 segundos para un CV con el máximo de contenido permitido (todas las secciones con 50 entradas activas).
- [ ] **CA-07:** Los campos con Markdown se renderizan correctamente en el PDF (negrita, itálica, enlaces clicables).

## Casos Borde

- [ ] **CB-01:** El usuario tiene un CV con contenido mínimo (solo nombre, email y una habilidad con una keyword) → el PDF se genera correctamente con el contenido centrado/alineado según la plantilla, sin áreas en blanco excesivas o desproporcionadas.
- [ ] **CB-02:** El usuario tiene un nombre con caracteres especiales (ej. "Jose Maria O'Brien-Garcia") → el nombre del archivo PDF reemplaza caracteres especiales por guiones bajos y el contenido dentro del PDF muestra los caracteres correctamente con codificación UTF-8.
- [ ] **CB-03:** El usuario envía múltiples solicitudes de generación de PDF en rápida sucesión (doble clic) → el sistema deshabilita el botón tras el primer clic y muestra un indicador de progreso, evitando solicitudes duplicadas.
- [ ] **CB-04:** El usuario genera un PDF con contenido que incluye URLs muy largas en campos Markdown → las URLs se truncan visualmente en el PDF con elipsis pero mantienen el enlace completo como hipervínculo clicable.

## Prioridad y Referencias

- **Prioridad:** Alta
- **Ticket:** Por crear
- **Dependencias funcionales:** F-01 (Formularios Estructurados — provee la estructura de datos), F-02 (Feature Flags — define qué entradas se incluyen)
- **Stakeholder:** Proyecto personal — Álvaro Ybáñez

## Notas del Analista

- La generación de PDF con Puppeteer/Playwright en función serverless tiene implicaciones de costo y cold start. Las plataformas serverless como Vercel Edge Functions tienen límites de tamaño de bundle (~50 MB) que pueden ser insuficientes para Chromium. Se recomienda explorar `@sparticuz/chromium` (Chromium optimizado para Lambda) o alojar el servicio de renderizado en un contenedor dedicado (ej. Cloud Run, Fly.io).
- El requisito de pixel-perfect cross-platform se satisface inherentemente por el enfoque server-side: al renderizar siempre con la misma instancia de Chromium, el resultado es determinista.
- Se identifica un riesgo de abuso (ataques DDoS al endpoint de generación de PDF). Para el MVP (sin autenticación) se recomienda implementar rate limiting básico (ej. máximo 10 generaciones por IP por hora).
- La medición de desbordamiento de página ("¿cabe en 1 página?") se puede realizar en el servidor midiendo la altura del DOM renderizado contra la altura disponible del formato A4 (297mm - márgenes). Esto añade una pasada de renderizado adicional antes de generar el PDF.
