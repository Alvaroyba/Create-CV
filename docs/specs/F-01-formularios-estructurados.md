# Feature: F-01 — Formularios Estructurados de CV

## Problema de Negocio

Los profesionales necesitan introducir y mantener actualizada su información laboral, educativa y de habilidades de manera rápida y sin errores de formato. Los editores de texto libre o WYSIWYG permiten inconsistencias (formatos de fecha distintos, viñetas rotas, HTML malformado). Los formularios estructurados eliminan esta variabilidad al definir campos tipados con validaciones explícitas, asegurando que los datos ingresados siempre sean compatibles con el motor de renderizado.

## Usuario Objetivo

- **Rol:** Profesional que crea o edita su currículum.
- **Contexto de uso:** Mobile — interfaz tipo wizard/tabs para navegación por secciones táctiles. Desktop — pantalla dividida con formulario a la izquierda y vista previa en tiempo real a la derecha.

## Flujo Principal (Happy Path)

1. El usuario accede a la aplicación web desde su navegador (móvil o escritorio).
2. Visualiza una pantalla de bienvenida con dos opciones: "Crear CV nuevo" o "Continuar editando" (si existen datos en localStorage).
3. Selecciona "Crear CV nuevo" y el sistema muestra el formulario de la sección **Datos Personales** (basics).
4. Completa los campos obligatorios: nombre completo y al menos un dato de contacto (email o teléfono).
5. Navega a la siguiente sección mediante tabs (mobile) o scroll (desktop): **Experiencia Laboral**, **Educación**, **Habilidades**, **Idiomas**, **Proyectos**, **Certificaciones**, **Voluntariado**, **Publicaciones**.
6. En cada sección, añade entradas mediante un botón "Agregar [nombre de sección]".
7. Para cada entrada, completa los campos correspondientes. Los campos de descripción y viñetas (highlights) aceptan formato Markdown básico (**negrita**, *itálica*, [enlaces](url)).
8. El sistema auto-guarda cada cambio en localStorage con un debounce de 500ms.
9. En desktop, la vista previa del CV se actualiza en tiempo real a la derecha del formulario.
10. El usuario ve un indicador visual de auto-guardado ("Guardado") junto a la última hora de guardado.

## Flujos Alternativos

- Si el usuario accede y ya existen datos en localStorage, se carga automáticamente el CV guardado y se muestra "Continuar editando" como opción principal.
- Si el usuario accede desde mobile, las secciones se presentan como tabs o acordeón con navegación inferior. No se muestra vista previa en tiempo real (se accede mediante un botón "Ver preview").
- Si el usuario desea reordenar entradas dentro de una sección (ej. cambiar el orden de experiencias laborales), puede arrastrar y soltar (drag & drop) o usar flechas arriba/abajo.
- Si el usuario desea eliminar una entrada, presiona un botón de eliminar, el sistema muestra confirmación "¿Eliminar esta entrada? Esta acción no se puede deshacer" y procede si el usuario confirma.

## Reglas de Negocio

- El campo **nombre completo** (basics.name) es obligatorio y no puede estar vacío.
- Al menos un dato de contacto (email o teléfono) es obligatorio para poder generar el PDF.
- Al menos una sección adicional a basics debe contener como mínimo una entrada para que el PDF se pueda generar (experiencia, educación, habilidades, idiomas, proyectos, certificaciones, voluntariado o publicaciones).
- Los campos de fecha aceptan el formato `YYYY-MM` o `YYYY`. No se aceptan fechas futuras en campos `startDate`.
- Si `endDate` está vacío u omitido en una experiencia laboral, se interpreta como "Actualmente" en la plantilla.
- Los campos de descripción (summary, highlights) aceptan Markdown básico: `**negrita**`, `*itálica*`, `[texto](url)`, listas con `- `. No se soporta HTML en crudo.
- Todo texto ingresado se sanitiza en cliente antes de enviar al servidor: se escapan etiquetas HTML y se eliminan scripts embebidos.
- Los datos se guardan en localStorage bajo la clave `headless-cv-data` como JSON serializado.
- El auto-guardado tiene un debounce de 500ms desde la última pulsación de tecla.
- Cada sección admite un máximo de 50 entradas (límite de seguridad para evitar payloads excesivos).

## Casos de Error (desde la perspectiva del usuario)

- Si el usuario intenta generar el PDF sin completar el nombre → se muestra mensaje: "El campo 'Nombre completo' es obligatorio para generar tu CV."
- Si el usuario intenta generar el PDF sin al menos un dato de contacto → se muestra mensaje: "Debes incluir al menos un email o teléfono de contacto."
- Si el usuario intenta generar el PDF sin contenido en ninguna sección → se muestra mensaje: "Añade al menos una entrada en alguna sección (experiencia, educación, habilidades...) para generar tu CV."
- Si el usuario ingresa una fecha con formato inválido → se muestra mensaje inline: "Formato de fecha no válido. Usa YYYY-MM (ej. 2024-03) o YYYY."
- Si el usuario ingresa una fecha de inicio futura → se muestra mensaje inline: "La fecha de inicio no puede ser posterior a hoy."
- Si el usuario ingresa una fecha de fin anterior a la fecha de inicio → se muestra mensaje inline: "La fecha de fin no puede ser anterior a la fecha de inicio."
- Si el localStorage está lleno y el auto-guardado falla → se muestra un banner persistente: "No se pudieron guardar los cambios automáticamente. Exporta tu CV como JSON para no perder tu trabajo."
- Si el usuario intenta agregar más de 50 entradas en una sección → se muestra mensaje: "Has alcanzado el límite máximo de entradas en esta sección (50)."

## Datos Involucrados

### Datos de entrada

| Campo | Tipo | Obligatorio | Máx. caracteres | Notas |
| ----- | ---- | ----------- | --------------- | ----- |
| basics.name | texto libre | Sí | 100 | — |
| basics.label | texto libre | No | 120 | Título profesional |
| basics.email | texto (email) | Condicional | — | Obligatorio si no hay teléfono |
| basics.phone | texto (teléfono) | Condicional | — | Obligatorio si no hay email |
| basics.url | URL válida | No | — | — |
| basics.summary | texto + Markdown | No | 2000 | — |
| basics.location.city | texto libre | No | 100 | — |
| basics.location.country | texto libre | No | 100 | — |
| basics.profiles[] | network, username, url | No | — | Redes sociales |
| work[].company | texto libre | Sí (en entrada) | 100 | — |
| work[].position | texto libre | Sí (en entrada) | 120 | — |
| work[].startDate | YYYY-MM o YYYY | Sí (en entrada) | — | No acepta fechas futuras |
| work[].endDate | YYYY-MM o YYYY | No | — | Vacío = "Actualmente" |
| work[].summary | texto + Markdown | No | 2000 | — |
| work[].highlights[] | texto + Markdown | No | 500 c/u | — |
| work[].isActive | booleano | Sí | — | Default: true |
| education[].institution | texto libre | Sí (en entrada) | 100 | — |
| education[].area | texto libre | Sí (en entrada) | 120 | Campo de estudio |
| education[].studyType | texto libre | No | 80 | Grado, Máster, etc. |
| education[].startDate | YYYY-MM o YYYY | Sí (en entrada) | — | — |
| education[].endDate | YYYY-MM o YYYY | No | — | — |
| education[].score | texto libre | No | 20 | Nota media, GPA |
| education[].courses[] | lista de textos | No | — | — |
| education[].isActive | booleano | Sí | — | Default: true |
| skills[].name | texto libre | Sí (en entrada) | 80 | Categoría de habilidad |
| skills[].level | texto libre | No | 40 | Experto, Intermedio, etc. |
| skills[].keywords[] | lista de textos | Sí | — | Al menos 1 |
| skills[].isActive | booleano | Sí | — | Default: true |
| languages[].language | texto libre | Sí (en entrada) | 60 | — |
| languages[].fluency | texto libre | Sí (en entrada) | 40 | Nativo, Profesional, etc. |
| languages[].isActive | booleano | Sí | — | Default: true |
| projects[].name | texto libre | Sí (en entrada) | 100 | — |
| projects[].description | texto + Markdown | No | 2000 | — |
| projects[].highlights[] | texto + Markdown | No | — | — |
| projects[].keywords[] | lista de textos | No | — | — |
| projects[].startDate | YYYY-MM o YYYY | No | — | — |
| projects[].endDate | YYYY-MM o YYYY | No | — | — |
| projects[].url | URL válida | No | — | — |
| projects[].isActive | booleano | Sí | — | Default: true |
| certifications[].name | texto libre | Sí (en entrada) | 120 | — |
| certifications[].issuer | texto libre | Sí (en entrada) | 100 | — |
| certifications[].date | YYYY-MM o YYYY | No | — | — |
| certifications[].url | URL válida | No | — | — |
| certifications[].isActive | booleano | Sí | — | Default: true |
| volunteer[].organization | texto libre | Sí (en entrada) | 100 | — |
| volunteer[].position | texto libre | Sí (en entrada) | 120 | — |
| volunteer[].startDate | YYYY-MM o YYYY | Sí (en entrada) | — | — |
| volunteer[].endDate | YYYY-MM o YYYY | No | — | — |
| volunteer[].summary | texto + Markdown | No | 2000 | — |
| volunteer[].highlights[] | texto + Markdown | No | — | — |
| volunteer[].isActive | booleano | Sí | — | Default: true |
| publications[].name | texto libre | Sí (en entrada) | 200 | — |
| publications[].publisher | texto libre | Sí (en entrada) | 100 | — |
| publications[].releaseDate | YYYY-MM o YYYY | No | — | — |
| publications[].url | URL válida | No | — | — |
| publications[].summary | texto + Markdown | No | 2000 | — |
| publications[].isActive | booleano | Sí | — | Default: true |

### Datos de salida

- Vista previa del CV renderizada en HTML dentro de un contenedor virtual de dimensiones A4 (210mm x 297mm) — visible en desktop en tiempo real.
- Indicador de auto-guardado con timestamp ("Guardado — 14:32").
- Indicador visual si el contenido excede el límite de página configurado.

## APIs Disponibles

_No aplica para esta feature — los formularios operan enteramente en cliente con persistencia en localStorage. La validación de esquema (Zod) se ejecuta en cliente antes de enviar datos al motor de renderizado (Feature F-03)._

## Mockups / Wireframes

No disponibles. Se sugiere seguir los patrones de referencia de editores de formulario estructurado como: jsonresume.org/editor, flowcv.io (sección de formularios, no el canvas).

## Fuera de Alcance

- NO incluye edición visual directa sobre la vista previa (el usuario no arrastra ni redimensiona elementos).
- NO incluye Rich Text Editor (WYSIWYG) — solo Markdown básico.
- NO incluye corrector ortográfico integrado (se delega al navegador).
- NO incluye sugerencias de contenido con IA (se deja para fase posterior).
- NO incluye soporte para múltiples CVs simultáneos (un único CV por instancia de navegador).

## Criterios de Aceptación

- [ ] **CA-01:** El usuario puede crear un CV nuevo completando al menos el nombre completo, un dato de contacto, y una entrada en cualquier sección, y ver la información reflejada en la vista previa (desktop).
- [ ] **CA-02:** Todos los cambios realizados en los formularios se persisten automáticamente en localStorage con un debounce de 500ms y se restauran al recargar la página.
- [ ] **CA-03:** Los campos de descripción y highlights renderizan correctamente Markdown básico (**negrita**, *itálica*, [enlaces](url)) en la vista previa.
- [ ] **CA-04:** Las validaciones de campos obligatorios, formatos de fecha y límites de caracteres muestran mensajes de error inline descriptivos sin bloquear la edición de otros campos.
- [ ] **CA-05:** En mobile, la interfaz presenta las secciones como tabs/acordeón navegables individualmente con un botón explícito "Ver preview" para acceder a la vista previa.
- [ ] **CA-06:** El usuario puede agregar, editar, eliminar y reordenar entradas dentro de cualquier sección del CV.
- [ ] **CA-07:** Todo texto ingresado se sanitiza eliminando etiquetas HTML y scripts antes de persistirse o enviarse al motor de renderizado.

## Casos Borde

- [ ] **CB-01:** El usuario pega un bloque de texto extremadamente largo (>10.000 caracteres) en un campo de descripción → el sistema trunca al límite máximo (2000 caracteres) y muestra un aviso: "El texto ha sido recortado al límite máximo de 2.000 caracteres."
- [ ] **CB-02:** El usuario borra manualmente la clave `headless-cv-data` de localStorage y recarga la página → la aplicación muestra la pantalla de bienvenida como si fuera un usuario nuevo, sin errores en consola.
- [ ] **CB-03:** El usuario tiene todas las entradas de todas las secciones con `isActive: false` e intenta generar el PDF → se aplica la regla de "al menos 1 sección con contenido" y se muestra: "Activa al menos una entrada en alguna sección para generar tu CV."
- [ ] **CB-04:** El usuario ingresa caracteres especiales o emojis (ej. "Developpeur") en campos de texto → el sistema los almacena y renderiza correctamente sin romper el diseño.
- [ ] **CB-05:** El navegador tiene localStorage deshabilitado o lleno → se muestra un banner persistente informando al usuario y sugiriendo exportar JSON.

## Prioridad y Referencias

- **Prioridad:** Alta
- **Ticket:** Por crear
- **Dependencias funcionales:** Ninguna (es la feature fundacional)
- **Stakeholder:** Proyecto personal — Álvaro Ybáñez

## Notas del Analista

- El modelo de datos es extenso (9 secciones iterables + basics). Se recomienda implementar la UI de formularios de forma genérica/componentizada: un componente `SectionForm<T>` que reciba la definición de campos y renderice dinámicamente, evitando 9 componentes completamente distintos.
- La decisión de usar Markdown básico en lugar de un Rich Text Editor es deliberada y clave para la propuesta de valor. Debe comunicarse de forma clara al usuario con hints visuales (ej. "Puedes usar **negrita** y *itálica*" junto a los campos que lo soporten).
- Se asume que el auto-guardado en localStorage tiene un límite práctico de ~5-10 MB dependiendo del navegador. Con un CV de texto puro esto nunca debería ser un problema, pero conviene manejar la excepción `QuotaExceededError`.
