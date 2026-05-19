# Feature: F-04 — Importación y Exportación de Datos (JSON Resume)

## Problema de Negocio

Los usuarios que ya tienen su información profesional estructurada en formato JSON Resume (estándar abierto) o en otra instancia de Headless CV necesitan una forma de cargar esos datos sin reescribirlos manualmente. Asimismo, dado que la aplicación no tiene persistencia en la nube, los usuarios necesitan un mecanismo de backup/portabilidad que les permita exportar sus datos y restaurarlos en otro dispositivo o navegador, protegiendo contra la pérdida de datos por borrado de caché.

## Usuario Objetivo

- **Rol:** Profesional que ya tiene datos de CV en formato JSON Resume o que necesita hacer backup/transferencia de sus datos entre dispositivos.
- **Contexto de uso:** Puntual — al configurar la herramienta por primera vez (importación) o antes de cambiar de dispositivo/borrar caché (exportación).

## Flujo Principal (Happy Path) — Importación

1. El usuario accede a la aplicación y selecciona la opción "Importar JSON" (accesible desde la pantalla de bienvenida o desde un menú de configuración).
2. El sistema muestra un selector de archivos que acepta únicamente archivos `.json`.
3. El usuario selecciona un archivo JSON desde su dispositivo.
4. El sistema parsea el archivo y valida su estructura contra el esquema JSON Resume esperado (validación Zod).
5. Si la validación es exitosa, el sistema muestra un resumen de los datos detectados: "Se encontraron: 5 experiencias laborales, 3 educaciones, 8 habilidades, 2 idiomas...".
6. El usuario confirma la importación presionando "Importar datos".
7. Si ya existían datos previos en localStorage, el sistema pregunta: "Ya tienes un CV guardado. ¿Deseas reemplazarlo con los datos importados?" con opciones "Reemplazar" / "Cancelar".
8. Los datos se cargan en la aplicación, se guardan en localStorage y se reflejan en los formularios y la vista previa.
9. Se muestra confirmación: "Datos importados correctamente."

## Flujo Principal (Happy Path) — Exportación

1. El usuario accede a la opción "Exportar JSON" (desde un menú de configuración o barra de acciones).
2. El sistema serializa los datos actuales del CV (incluyendo estado de todos los toggles `isActive`) a formato JSON.
3. El navegador inicia la descarga automática del archivo con nombre `CV_[Nombre]_[YYYY-MM-DD].json`.
4. Se muestra confirmación: "Datos exportados correctamente."

## Flujos Alternativos

- Si el archivo JSON importado contiene campos adicionales no reconocidos por el esquema → se ignoran los campos desconocidos y se importan solo los campos válidos, mostrando un aviso: "Algunos campos del archivo no fueron reconocidos y se han omitido."
- Si el archivo JSON importado no contiene el campo `isActive` en las entradas → se asigna `isActive: true` por defecto a todas las entradas.
- Si el usuario cancela la confirmación de reemplazo → no se modifica ningún dato existente y se cierra el diálogo.

## Reglas de Negocio

- El formato de importación aceptado es exclusivamente JSON, compatible con el estándar JSON Resume (https://jsonresume.org/schema/).
- Los campos del archivo importado se mapean al modelo de datos interno de Headless CV. Los campos no reconocidos se descartan silenciosamente.
- La importación reemplaza completamente los datos existentes (no hay merge/fusión de datos).
- La exportación incluye todos los datos del CV, incluyendo entradas con `isActive: false` y el valor de cada toggle.
- El tamaño máximo del archivo de importación es de 1 MB.
- El archivo exportado se formatea con indentación de 2 espacios para legibilidad humana.
- El encoding del archivo es UTF-8.

## Casos de Error (desde la perspectiva del usuario)

- Si el usuario selecciona un archivo que no es JSON → se muestra mensaje: "El archivo seleccionado no es un archivo JSON válido. Por favor, selecciona un archivo con extensión .json."
- Si el archivo JSON tiene errores de sintaxis (JSON malformado) → se muestra mensaje: "El archivo contiene errores de formato y no se pudo leer. Verifica que sea un archivo JSON válido."
- Si el archivo JSON es válido pero no contiene ninguna sección reconocible del esquema de CV → se muestra mensaje: "El archivo no contiene datos de currículum reconocibles. Asegúrate de usar un archivo compatible con el formato JSON Resume."
- Si el archivo excede 1 MB → se muestra mensaje: "El archivo es demasiado grande (máximo 1 MB). Verifica que el archivo contenga solo datos de currículum."
- Si la exportación falla por un error inesperado → se muestra mensaje: "No se pudieron exportar los datos. Intenta de nuevo."

## Datos Involucrados

### Datos de entrada (Importación)

- Archivo JSON (.json): formato JSON Resume, máximo 1 MB, encoding UTF-8.

### Datos de salida (Exportación)

- Archivo JSON (.json): modelo de datos completo de Headless CV con indentación de 2 espacios.
- Nombre de archivo: `CV_[Nombre]_[YYYY-MM-DD].json`.

## APIs Disponibles

_No aplica — la importación y exportación operan enteramente en cliente. El parseo, validación y serialización se ejecutan en el navegador._

## Mockups / Wireframes

No disponibles. Se sugiere que las opciones "Importar JSON" y "Exportar JSON" se ubiquen en un menú secundario o sección de configuración, no en la interfaz principal de edición, para evitar confusión con el flujo de descarga de PDF.

## Fuera de Alcance

- NO incluye importación desde LinkedIn, Indeed, PDF u otros formatos que no sean JSON.
- NO incluye importación desde URL (ej. pegar un enlace a un JSON Resume hospedado online).
- NO incluye fusión/merge de datos importados con datos existentes (la importación siempre reemplaza).
- NO incluye versionado de exportaciones (no se guardan históricos de archivos exportados).
- NO incluye sincronización automática con servicios de almacenamiento en la nube (Google Drive, Dropbox, etc.).

## Criterios de Aceptación

- [ ] **CA-01:** El usuario puede importar un archivo JSON válido compatible con JSON Resume y ver los datos cargados correctamente en todos los formularios del CV.
- [ ] **CA-02:** El usuario puede exportar sus datos actuales como archivo JSON y reimportarlos en otra instancia de la aplicación sin pérdida de datos (incluyendo estados de toggles).
- [ ] **CA-03:** Si el archivo importado contiene campos `isActive`, se respetan. Si no los contiene, se asigna `true` por defecto.
- [ ] **CA-04:** Si ya existen datos guardados, la importación solicita confirmación antes de reemplazar los datos existentes.
- [ ] **CA-05:** Los errores de formato, sintaxis o esquema del archivo importado se comunican al usuario con mensajes claros y específicos.
- [ ] **CA-06:** La exportación genera un archivo JSON con indentación de 2 espacios, encoding UTF-8 y nombre de archivo que incluye el nombre del usuario y la fecha.

## Casos Borde

- [ ] **CB-01:** El usuario importa un archivo JSON Resume v1.0.0 que usa campos legacy (ej. `website` en lugar de `url`) → el sistema mapea los campos legacy a los campos actuales del modelo o los descarta con aviso.
- [ ] **CB-02:** El usuario importa un archivo JSON con un array vacío en todas las secciones (ej. `"work": []`) → el sistema carga los datos básicos y muestra la interfaz con secciones vacías, sin errores.
- [ ] **CB-03:** El usuario exporta un CV que contiene emojis y caracteres Unicode extendidos → el archivo JSON exportado mantiene los caracteres correctamente sin escapado innecesario.
- [ ] **CB-04:** El usuario intenta importar un archivo JSON que en realidad es un array `[{...}]` en lugar de un objeto `{...}` → se muestra error: "El formato del archivo no es compatible. Se esperaba un objeto JSON con la estructura de un currículum."

## Prioridad y Referencias

- **Prioridad:** Media
- **Ticket:** Por crear
- **Dependencias funcionales:** F-01 (Formularios Estructurados — define el modelo de datos y la validación Zod)
- **Stakeholder:** Proyecto personal — Álvaro Ybáñez

## Notas del Analista

- El estándar JSON Resume (jsonresume.org) tiene una especificación formal de esquema. Se recomienda incluir el campo `$schema` en los archivos exportados para facilitar la interoperabilidad: `"$schema": "https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json"`.
- La funcionalidad de exportación JSON es crítica como mitigación del riesgo de pérdida de datos en localStorage. Se recomienda mostrar un recordatorio periódico al usuario (ej. cada 7 días de uso): "Recuerda exportar tu CV como JSON para tener un respaldo de seguridad."
- El campo `isActive` es una extensión propietaria de Headless CV sobre el estándar JSON Resume. Si el usuario exporta e intenta usar el archivo en otra herramienta basada en JSON Resume, el campo `isActive` será ignorado por esa herramienta (comportamiento correcto). Documentar esto en una sección de ayuda o tooltip.
