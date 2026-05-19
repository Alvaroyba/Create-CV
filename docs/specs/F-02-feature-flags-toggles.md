# Feature: F-02 — Feature Flags / Toggles para Contenido del CV

## Problema de Negocio

Un profesional con amplia trayectoria necesita adaptar su CV a diferentes ofertas laborales sin duplicar archivos ni reescribir contenido. Por ejemplo, un desarrollador fullstack puede querer desactivar sus proyectos de backend cuando aplica a un rol puramente frontend, o silenciar ciertas certificaciones irrelevantes para una vacante específica. Sin esta funcionalidad, el usuario se ve forzado a mantener múltiples versiones del mismo CV, con el riesgo de inconsistencias y la carga operativa de actualizar datos en paralelo.

## Usuario Objetivo

- **Rol:** Profesional que adapta su CV a distintas búsquedas laborales o contextos.
- **Contexto de uso:** Mobile o desktop. Ajuste rápido antes de enviar una candidatura. Interacción frecuente y de baja duración (toggle on/off en segundos).

## Flujo Principal (Happy Path)

1. El usuario accede a su CV previamente cargado con múltiples entradas en distintas secciones.
2. Junto a cada entrada (experiencia laboral, proyecto, habilidad, etc.) visualiza un interruptor (toggle switch) claramente visible.
3. El usuario desactiva (toggle off) las entradas que no son relevantes para la vacante objetivo. El toggle pasa visualmente a estado "apagado" (gris/atenuado).
4. La vista previa del CV se actualiza en tiempo real: las entradas desactivadas desaparecen del documento renderizado.
5. El usuario puede verificar en la vista previa que el CV resultante contiene solo la información deseada.
6. El cambio de estado se auto-guarda en localStorage inmediatamente.
7. Cuando el usuario descarga el PDF (Feature F-03), el documento solo incluye las entradas con `isActive: true`.

## Flujos Alternativos

- Si el usuario desea reactivar una entrada previamente desactivada → mueve el toggle a "on", la entrada reaparece en la vista previa inmediatamente.
- Si el usuario desea desactivar una sección completa rápidamente (ej. toda la sección de Voluntariado) → se proporciona un toggle a nivel de sección que actúa como "master switch" desactivando/activando todas las entradas hijas de esa sección.
- Si el usuario desea ver qué entradas están desactivadas → en el formulario, las entradas con `isActive: false` se muestran con estilo atenuado (opacidad reducida) pero siguen siendo visibles y editables.

## Reglas de Negocio

- El campo `isActive` es un booleano presente en cada entrada de cada sección iterable (work, education, skills, languages, projects, certifications, volunteer, publications).
- El valor por defecto de `isActive` al crear una nueva entrada es `true`.
- La sección **basics** (datos personales) no tiene toggle — siempre se incluye en el CV.
- Si un toggle de sección (master switch) se desactiva, todas las entradas hijas se marcan como `isActive: false`. Si se reactiva, todas las entradas vuelven a su estado anterior al desactivar (no se fuerzan todas a `true`; se restaura el estado previo).
- La validación de "al menos 1 sección con contenido activo" (de F-01) se evalúa sobre las entradas con `isActive: true`.
- Los toggles operan exclusivamente en cliente (localStorage). No requieren comunicación con el servidor.
- El estado de los toggles se incluye en la exportación JSON y se respeta en la importación.

## Casos de Error (desde la perspectiva del usuario)

- Si el usuario desactiva todas las entradas de todas las secciones e intenta generar el PDF → se muestra mensaje: "Activa al menos una entrada en alguna sección para generar tu CV."
- Si ocurre un error al persistir el cambio de toggle en localStorage → se muestra un aviso transitorio: "No se pudo guardar el cambio. Verifica el espacio de almacenamiento de tu navegador."

## Datos Involucrados

### Datos de entrada

- **isActive** (por entrada): booleano, obligatorio, valor por defecto `true`.
- **Toggle de sección** (master switch): control de UI que modifica batch de `isActive` en las entradas hijas.

### Datos de salida

- Vista previa actualizada mostrando solo entradas con `isActive: true`.
- En el formulario, las entradas desactivadas se muestran atenuadas (opacidad ~50%) con su toggle en estado "off".

## APIs Disponibles

_No aplica — funcionalidad enteramente en cliente._

## Mockups / Wireframes

No disponibles. Referencia de patrón UX: interruptores tipo iOS/Material Design junto a cada tarjeta de entrada, con transición animada (300ms ease).

## Fuera de Alcance

- NO incluye "perfiles" o "vistas guardadas" (combinaciones predefinidas de toggles con nombre). Se deja para fase posterior.
- NO incluye toggles a nivel de campo individual dentro de una entrada (ej. ocultar solo la descripción pero mostrar el título). El toggle opera a nivel de entrada completa.
- NO incluye lógica condicional entre toggles (ej. "si activo proyecto X, activar automáticamente skill Y").

## Criterios de Aceptación

- [ ] **CA-01:** Cada entrada en cada sección iterable muestra un toggle switch visible que permite activar/desactivar esa entrada.
- [ ] **CA-02:** Al desactivar una entrada, esta desaparece de la vista previa del CV en tiempo real (máximo 300ms de latencia visual).
- [ ] **CA-03:** Al reactivar una entrada previamente desactivada, reaparece en la vista previa en su posición original dentro de la sección.
- [ ] **CA-04:** Existe un toggle a nivel de sección (master switch) que desactiva/activa todas las entradas de esa sección, respetando el estado previo individual al reactivar.
- [ ] **CA-05:** El PDF generado (Feature F-03) incluye exclusivamente las entradas con `isActive: true`.
- [ ] **CA-06:** El estado de los toggles se persiste en localStorage y se restaura correctamente al recargar la página.

## Casos Borde

- [ ] **CB-01:** El usuario tiene 30 experiencias laborales, desactiva 28 y genera el PDF → el documento solo muestra las 2 activas con el diseño correcto, sin espacios vacíos ni saltos de página innecesarios.
- [ ] **CB-02:** El usuario desactiva el master switch de una sección, luego reactiva manualmente una entrada individual dentro de esa sección → el master switch pasa a estado "indeterminado" o "parcialmente activo" (visual diferenciado), y la entrada reactivada aparece en la preview.
- [ ] **CB-03:** El usuario importa un archivo JSON Resume que no contiene el campo `isActive` en sus entradas → el sistema asigna `isActive: true` por defecto a todas las entradas importadas.

## Prioridad y Referencias

- **Prioridad:** Alta
- **Ticket:** Por crear
- **Dependencias funcionales:** F-01 (Formularios Estructurados — define la estructura de datos y la UI base)
- **Stakeholder:** Proyecto personal — Álvaro Ybáñez

## Notas del Analista

- La funcionalidad de master switch con restauración de estado previo requiere almacenar un "snapshot" del estado de los toggles hijos al momento de desactivar la sección. Se sugiere un campo auxiliar `_previousActiveState` en memoria (no persistido en JSON) o bien persistir un mapa `{entryId: previousIsActive}` en localStorage.
- El estado "indeterminado" del master switch (CB-02) es un patrón de UI conocido (checkbox indeterminate). Se recomienda usar un tercer estado visual (ej. dash horizontal en lugar de check) para comunicar al usuario que hay una mezcla de entradas activas e inactivas.
- Esta feature es el principal diferenciador del producto frente a competidores. Se recomienda invertir en una UX impecable: la interacción debe sentirse instantánea y satisfactoria (animaciones fluidas, feedback háptico en mobile si es posible).
