# Feature: F-05 — Carga de CV (PDF) con Autorelleno por IA

## Problema de Negocio

Muchos profesionales ya tienen un CV en formato PDF pero no en formato estructurado (JSON). Obligarlos a reescribir manualmente toda su información campo por campo en los formularios genera una barrera de entrada que puede provocar abandono. La posibilidad de subir el PDF actual y que un modelo de inteligencia artificial extraiga automáticamente los datos hacia los campos del formulario reduce drásticamente el tiempo de onboarding: de 30-60 minutos de carga manual a menos de 2 minutos de revisión y ajuste.

## Usuario Objetivo

- **Rol:** Profesional que ya tiene un CV existente en PDF y quiere empezar a usar Headless CV sin reescribir su información.
- **Contexto de uso:** Primer uso de la herramienta (onboarding). Acción puntual y única. Mobile o desktop.

## Flujo Principal (Happy Path)

1. El usuario accede a la aplicación y selecciona la opción "Importar desde PDF" (accesible desde la pantalla de bienvenida junto a "Crear CV nuevo" e "Importar JSON").
2. El sistema verifica si el usuario tiene una API key configurada. Si no la tiene, muestra un aviso: "Para extraer datos de tu PDF necesitas configurar una API key de un proveedor de IA" con un enlace a la sección de configuración.
3. El usuario navega a la sección de configuración y registra su API key (OpenAI, Anthropic u otro proveedor soportado).
4. De vuelta al flujo de importación, el sistema muestra un selector de archivos que acepta únicamente archivos `.pdf`.
5. El usuario selecciona su CV en PDF desde su dispositivo.
6. El sistema extrae el texto del PDF en cliente (ej. pdf.js) y lo envía al LLM configurado junto con un prompt estructurado que solicita la respuesta en formato JSON Resume.
7. Mientras se procesa, el sistema muestra un indicador de progreso: "Analizando tu CV... Esto puede tardar unos segundos."
8. El LLM retorna los datos estructurados. El sistema valida el JSON resultante contra el esquema Zod.
9. El sistema muestra un resumen de los datos extraídos: "Se detectaron: nombre, 4 experiencias laborales, 2 educaciones, 6 habilidades, 3 idiomas...".
10. El usuario presiona "Cargar datos" para confirmar.
11. Si ya existían datos previos en localStorage, el sistema pregunta: "Ya tienes un CV guardado. ¿Deseas reemplazarlo con los datos extraídos?" con opciones "Reemplazar" / "Cancelar".
12. Los datos se cargan en los formularios y se guardan en localStorage.
13. Se muestra confirmación: "Datos extraídos correctamente. Revisa cada sección para verificar la información."
14. El usuario revisa y ajusta los datos en los formularios (correcciones, campos faltantes, etc.).

## Flujos Alternativos

- Si el usuario no tiene API key y no desea configurarla → se le ofrece como alternativa "Importar desde JSON" (F-04) o "Crear CV nuevo" (F-01).
- Si el LLM no logra extraer alguna sección (ej. no detecta educación) → la sección queda vacía en los formularios y se muestra un aviso: "No se detectaron datos de [sección]. Puedes agregarlos manualmente."
- Si el usuario desea cambiar de proveedor de IA → accede a la configuración, actualiza la API key y el proveedor, y repite el proceso de importación.

## Reglas de Negocio

- El servicio de parsing con IA funciona bajo el modelo BYOK (Bring Your Own Key): el usuario proporciona su propia API key del proveedor de IA que prefiera.
- Los proveedores soportados inicialmente son: OpenAI (GPT-4o, GPT-4o-mini) y Anthropic (Claude). La arquitectura debe permitir agregar nuevos proveedores sin cambios estructurales.
- La API key del usuario se almacena exclusivamente en localStorage del navegador, nunca se envía al backend del proyecto ni se persiste en servidor.
- El archivo PDF aceptado debe tener un tamaño máximo de 5 MB.
- El PDF debe contener texto extraíble (no se soportan PDFs que sean puramente imágenes/escaneados sin OCR).
- El prompt enviado al LLM debe solicitar la respuesta estrictamente en formato JSON Resume, incluyendo mapeo a todas las secciones del modelo de datos (basics, work, education, skills, languages, projects, certifications, volunteer, publications).
- Los datos extraídos se tratan como borrador: se cargan en los formularios con `isActive: true` por defecto, pero el usuario puede y debe revisar/corregir.
- Si la respuesta del LLM contiene campos que no validan contra el esquema Zod, se aplica tolerancia: se importan los campos válidos y se descartan los inválidos con aviso al usuario.
- La llamada a la API del LLM se realiza a través de una API route de Next.js que actúa como proxy mínimo (necesario por restricciones de CORS de algunos proveedores). La API key viaja en la request del cliente al proxy, se usa para la llamada al proveedor y no se almacena en servidor.
- Se limita a un máximo de 3 reintentos automáticos en caso de error temporal del proveedor.

## Casos de Error (desde la perspectiva del usuario)

- Si el usuario no tiene API key configurada e intenta importar un PDF → se muestra mensaje: "Necesitas configurar una API key para usar esta funcionalidad. Ve a Configuración > API Key para añadirla."
- Si la API key es inválida o ha expirado → se muestra mensaje: "La API key configurada no es válida o ha expirado. Verifica tu clave en la sección de Configuración."
- Si el usuario sube un archivo que no es PDF → se muestra mensaje: "Solo se aceptan archivos en formato PDF (.pdf)."
- Si el PDF excede 5 MB → se muestra mensaje: "El archivo es demasiado grande (máximo 5 MB). Intenta con un PDF más liviano."
- Si el PDF no contiene texto extraíble (es una imagen escaneada) → se muestra mensaje: "No se pudo extraer texto del PDF. Asegúrate de que tu CV no sea una imagen escaneada."
- Si el LLM no responde (timeout o error de red) → se muestra mensaje: "No se pudo conectar con el servicio de IA. Verifica tu conexión a internet e intenta de nuevo."
- Si el LLM retorna datos que no se pueden estructurar → se muestra mensaje: "No se pudieron extraer datos estructurados de tu CV. Intenta con un PDF con formato más convencional o carga los datos manualmente."
- Si la cuota de la API key del usuario se ha agotado → se muestra mensaje: "Tu cuenta de [proveedor] ha alcanzado su límite de uso. Verifica tu plan en la web del proveedor."

## Datos Involucrados

### Datos de entrada

| Campo | Tipo | Obligatorio | Notas |
| ----- | ---- | ----------- | ----- |
| Archivo PDF | .pdf | Si | Max. 5 MB, debe contener texto extraible |
| API Key | texto | Si | Almacenada en localStorage, nunca en servidor |
| Proveedor de IA | seleccion | Si | OpenAI / Anthropic (extensible) |
| Modelo | seleccion | No | Por defecto el mas economico del proveedor |

### Datos de salida

- JSON estructurado en formato JSON Resume con los datos extraidos del PDF.
- Resumen de datos detectados por seccion (conteo de entradas por categoria).
- Campos cargados en los formularios para revision y ajuste por el usuario.

## APIs Disponibles

### Servicio: Extraccion de texto del PDF

_Se ejecuta en cliente usando una libreria JavaScript de extraccion de texto (ej. pdf.js). No requiere backend._

### Servicio: Proxy de LLM (API route interna)

- **Endpoint:** `POST /api/parse-cv`
- **Descripcion:** Recibe el texto extraido del PDF y la API key del usuario, realiza la llamada al proveedor de IA seleccionado y retorna los datos estructurados. No almacena la API key.
- **Request:**
  ```json
  {
    "text": "[texto extraido del PDF]",
    "provider": "openai | anthropic",
    "apiKey": "[API key del usuario]",
    "model": "gpt-4o-mini"
  }
  ```
- **Response (exito):**
  ```json
  {
    "data": { "...": "Objeto JSON Resume extraido" },
    "sections": {
      "basics": true,
      "work": 4,
      "education": 2,
      "skills": 6,
      "languages": 3,
      "projects": 0,
      "certifications": 1,
      "volunteer": 0,
      "publications": 0
    },
    "warnings": ["No se detectaron datos de proyectos"]
  }
  ```
- **Codigos de error:**
  - `400` — Texto vacio o parametros faltantes
  - `401` — API key invalida (retransmitida desde el proveedor)
  - `429` — Cuota agotada del proveedor
  - `422` — El LLM no pudo estructurar los datos
  - `504` — Timeout del proveedor

## Mockups / Wireframes

No disponibles. Se sugiere:
- Boton "Importar desde PDF" junto a "Importar JSON" en la pantalla de bienvenida o menu de importacion, con un icono de documento PDF.
- Seccion de configuracion accesible desde un icono de engranaje con formulario: Proveedor (dropdown) + API Key (input tipo password con toggle de visibilidad) + boton "Verificar clave".
- Indicador de progreso tipo spinner durante el procesamiento del LLM.

## Fuera de Alcance

- NO incluye OCR de PDFs escaneados (solo PDFs con texto digital extraible).
- NO incluye parsing de archivos Word (.docx), imagenes (.png, .jpg) ni otros formatos.
- NO incluye el costo de las llamadas a la API del LLM (es responsabilidad del usuario bajo BYOK).
- NO incluye un modelo de IA propio o auto-hospedado.
- NO incluye almacenamiento de la API key en servidor — solo localStorage.
- NO incluye revision automatica de calidad de los datos extraidos (el usuario es responsable de verificar).
- NO incluye merge/fusion de los datos extraidos con datos existentes — la importacion siempre reemplaza.

## Criterios de Aceptacion

- [ ] **CA-01:** El usuario puede subir un archivo PDF de su CV y, tras el procesamiento con IA, ver los datos extraidos cargados automaticamente en todos los formularios del CV.
- [ ] **CA-02:** El sistema soporta al menos dos proveedores de IA (OpenAI y Anthropic) y permite al usuario seleccionar cual usar desde la configuracion.
- [ ] **CA-03:** La API key del usuario se almacena exclusivamente en localStorage y nunca se persiste en el backend del proyecto.
- [ ] **CA-04:** Si el LLM no puede extraer alguna seccion, los campos correspondientes quedan vacios con un aviso especifico por seccion, sin bloquear la carga de las demas secciones.
- [ ] **CA-05:** Si ya existen datos previos en localStorage, se solicita confirmacion antes de reemplazarlos con los datos extraidos.
- [ ] **CA-06:** Los errores de API key invalida, cuota agotada, timeout y PDF sin texto se comunican con mensajes claros y accionables.
- [ ] **CA-07:** Tras la importacion, se muestra un mensaje invitando al usuario a revisar cada seccion: "Datos extraidos correctamente. Revisa cada seccion para verificar la informacion."

## Casos Borde

- [ ] **CB-01:** El usuario sube un PDF con formato visual complejo (columnas multiples, barras de progreso para skills, iconos) → el LLM puede no extraer todos los datos correctamente. Se cargan los que se detectaron y se avisa: "Algunos datos pueden no haberse extraido correctamente. Revisa y completa manualmente."
- [ ] **CB-02:** El usuario sube un PDF que no es un CV (ej. una factura, un articulo) → el LLM retorna datos vacios o incongruentes. El sistema muestra: "No se detecto contenido de curriculum en el archivo. Asegurate de subir un CV."
- [ ] **CB-03:** El usuario tiene una API key de OpenAI pero selecciona Anthropic como proveedor (o viceversa) → la llamada falla con error de autenticacion. Se muestra: "La API key no corresponde al proveedor seleccionado. Verifica la configuracion."
- [ ] **CB-04:** El PDF contiene texto en un idioma diferente al espanol (ej. ingles, portugues) → el LLM debe poder parsear CVs en cualquier idioma y mapear las secciones al formato estandar.
- [ ] **CB-05:** La respuesta del LLM excede el tamano esperado o contiene JSON malformado → se reintentan hasta 3 veces. Si persiste, se muestra: "No se pudieron procesar los datos. Intenta de nuevo o carga los datos manualmente."

## Prioridad y Referencias

- **Prioridad:** Media
- **Ticket:** Por crear
- **Dependencias funcionales:** F-01 (Formularios Estructurados — destino de los datos extraidos)
- **Stakeholder:** Proyecto personal — Alvaro Ybanez

## Notas del Analista

- El modelo BYOK transfiere el costo y la gestion de la API key al usuario. Esto elimina costos operativos pero introduce friccion en el onboarding. Se recomienda documentar claramente como obtener una API key de cada proveedor (enlaces directos a las paginas de registro/keys de OpenAI y Anthropic).
- La extraccion de texto del PDF se realiza en cliente con pdf.js (o similar) antes de enviar al LLM. Esto evita subir el PDF a un servidor propio y respeta la privacidad del usuario.
- La llamada desde el navegador a la API de Anthropic tiene restricciones de CORS. Se necesita un proxy minimo (API route de Next.js: `POST /api/parse-cv`) que reciba la API key del usuario, realice la llamada al proveedor y retorne el resultado — sin almacenar la key. OpenAI tambien se beneficia de este patron para no exponer la key en el codigo cliente.
- La calidad de la extraccion depende enormemente del formato del PDF original. CVs generados digitalmente (Word → PDF, Google Docs → PDF) tendran resultados mucho mejores que PDFs disenados en Canva o Figma con layouts complejos. Se debe gestionar la expectativa del usuario desde la UI.
- Se recomienda incluir en la configuracion un boton "Verificar clave" que haga una llamada minima al proveedor para confirmar que la key es valida antes de intentar el parsing completo.
