# Correccion: CORR-01 — Cambio de Formato de Pagina por Defecto a Letter

## Problema de Negocio

El formato de pagina actualmente definido por defecto es A4 (210mm x 297mm), estandar en Europa. Sin embargo, el mercado objetivo principal del producto utiliza formato Carta (Letter: 215.9mm x 279.4mm), estandar en America. Generar CVs en formato A4 cuando el destinatario espera Letter puede causar problemas de impresion (margenes cortados, reescalado automatico) y proyectar falta de atencion al detalle.

## Cambios Requeridos

### Documentos afectados

- **F-03 — Renderizado PDF Server-Side:** Cambiar el formato de pagina por defecto de A4 a Letter.
- **EPIC — Headless CV MVP:** Actualizar referencias al formato de pagina.
- **F-06 — Autoajuste:** Las medidas de referencia para calcular el espacio disponible deben usar Letter como base.

### Cambios especificos en F-03

| Elemento | Valor actual | Valor nuevo |
| -------- | ------------ | ----------- |
| Formato de pagina por defecto | A4 (210mm x 297mm) | Letter (215.9mm x 279.4mm) |
| Formato secundario disponible | No disponible | A4 (210mm x 297mm) como opcion |
| Viewport de renderizado Puppeteer | 210mm x 297mm | 215.9mm x 279.4mm |
| Campo `pageSize` por defecto en API | `"A4"` | `"letter"` |
| Valores aceptados de `pageSize` | Solo `"A4"` | `"letter"`, `"A4"` |

### Cambios en la API `POST /api/generate-pdf`

El campo `options.pageSize` pasa a aceptar dos valores:
```json
{
  "options": {
    "pageSize": "letter"
  }
}
```
Valores validos: `"letter"` (default), `"A4"`.

### Cambios en la UI

- En la seccion de configuracion o en el panel de descarga, agregar un selector de formato de pagina: "Carta (Letter)" / "A4".
- El valor por defecto es "Carta (Letter)".
- La vista previa del CV en desktop debe ajustar las dimensiones del contenedor virtual al formato seleccionado:
  - Letter: `w-[215.9mm] h-[279.4mm]`
  - A4: `w-[210mm] h-[297mm]`

## Reglas de Negocio

- Si el usuario no selecciona formato explicitamente, se usa Letter.
- La seleccion de formato se persiste en localStorage junto con las demas preferencias.
- Al exportar JSON (F-04), se incluye el formato de pagina seleccionado como metadato.
- Al importar JSON (F-04), si el archivo incluye un formato de pagina, se respeta. Si no lo incluye, se usa Letter por defecto.

## Criterios de Aceptacion

- [ ] **CA-01:** El formato de pagina por defecto al crear un CV nuevo es Letter (215.9mm x 279.4mm).
- [ ] **CA-02:** El usuario puede cambiar el formato a A4 desde la configuracion o panel de descarga, y el PDF generado refleja el formato seleccionado.
- [ ] **CA-03:** La vista previa en desktop ajusta sus dimensiones al formato seleccionado (Letter o A4).
- [ ] **CA-04:** La preferencia de formato de pagina se persiste en localStorage y se restaura al recargar.

## Casos Borde

- [ ] **CB-01:** El usuario cambia de Letter a A4 y tiene autoajuste activo → el motor recalcula el espacio disponible con las dimensiones de A4 (mas alto pero mas estrecho) y aplica el autoajuste correspondiente.
- [ ] **CB-02:** El usuario importa un JSON que tiene `pageSize: "A4"` → se carga A4 como formato seleccionado sin error.

## Prioridad y Referencias

- **Prioridad:** Alta
- **Ticket:** Por crear
- **Dependencias funcionales:** F-03, F-06
- **Stakeholder:** Proyecto personal — Alvaro Ybanez

## Notas del Analista

- Letter es 5.9mm mas ancho y 17.6mm mas corto que A4. Esto afecta los calculos de autoajuste de F-06: un contenido que cabe en A4 (mas alto) podria no caber en Letter, y viceversa para contenido que se beneficia del ancho extra. Las plantillas deben manejar ambos formatos correctamente.
