# Bugfix: BUG-02 — Boton Cancelar Duplicado en Dialogo de Importacion

## Problema Reportado

En el dialogo de confirmacion de importacion JSON (que aparece cuando ya existen datos previos en localStorage), se muestran dos botones "Cancelar" en lugar de uno.

## Comportamiento Actual (Incorrecto)

El dialogo de confirmacion muestra:
- Texto: "Ya tienes un CV guardado. Deseas reemplazarlo con los datos importados?"
- Boton 1: "Reemplazar"
- Boton 2: "Cancelar"
- Boton 3: "Cancelar" (duplicado)

## Comportamiento Esperado (Correcto)

El dialogo de confirmacion muestra:
- Texto: "Ya tienes un CV guardado. Deseas reemplazarlo con los datos importados?"
- Boton 1: "Reemplazar" (accion principal, estilo destacado)
- Boton 2: "Cancelar" (accion secundaria, un solo boton)

## Causa Probable

Es probable que el componente de dialogo incluya un boton "Cancelar" nativo (del componente Dialog/Modal) y adicionalmente se haya anadido un boton "Cancelar" explicito en el contenido del dialogo, resultando en la duplicacion.

## Criterios de Aceptacion

- [ ] **CA-01:** El dialogo de confirmacion de importacion muestra exactamente dos botones: "Reemplazar" y "Cancelar".
- [ ] **CA-02:** Ambos botones funcionan correctamente: "Reemplazar" ejecuta la importacion y "Cancelar" cierra el dialogo sin modificar datos.
- [ ] **CA-03:** Verificar que el mismo patron no se repita en otros dialogos de confirmacion de la aplicacion (ej. eliminar entrada, importar desde PDF).

## Prioridad y Referencias

- **Prioridad:** Media (cosmetico pero afecta percepcion de calidad)
- **Ticket:** Por crear
- **Feature afectada:** F-04 — Importacion y Exportacion de Datos
- **Stakeholder:** Proyecto personal — Alvaro Ybanez
