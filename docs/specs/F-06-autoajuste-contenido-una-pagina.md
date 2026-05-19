# Feature: F-06 — Autoajuste de Contenido para Forzar 1 Pagina

## Problema de Negocio

Muchos reclutadores y sistemas ATS prefieren o exigen CVs de una sola pagina, especialmente para perfiles junior o mid-level. Cuando el contenido del usuario excede el espacio disponible, la solucion actual (F-03 original) era bloquear la generacion y pedir al usuario que reduzca contenido manualmente. Esto genera frustracion y multiples iteraciones de prueba y error. Un sistema de autoajuste que reduzca progresivamente margenes, interlineado y tamano de fuente — hasta un limite minimo legible — permite al usuario mantener todo su contenido relevante y obtener un PDF que quepa en una sola hoja sin intervencion manual.

## Usuario Objetivo

- **Rol:** Profesional que necesita entregar un CV de 1 pagina y tiene mas contenido del que cabe con la configuracion estandar de la plantilla.
- **Contexto de uso:** Al momento de generar el PDF. El usuario ha completado su contenido y activado los toggles deseados, pero el resultado excede una pagina.

## Flujo Principal (Happy Path)

1. El usuario ha completado su CV y tiene la opcion "Limitar a 1 pagina" activada (o es el comportamiento por defecto).
2. El usuario presiona "Descargar PDF".
3. El sistema envia los datos al servidor de renderizado (F-03).
4. El servidor renderiza el HTML con la configuracion estandar de la plantilla (fuente base, interlineado base, margenes base).
5. El motor mide la altura total del contenido renderizado y detecta que excede el espacio disponible de la pagina (Letter: 279.4mm menos margenes).
6. El motor inicia la secuencia de autoajuste automaticamente, en este orden:
   - **Paso 1 — Reducir margenes:** Disminuir margenes de pagina progresivamente desde el valor base hasta el minimo permitido.
   - **Paso 2 — Reducir interlineado:** Si aun no cabe, disminuir el interlineado progresivamente desde el valor base hasta el minimo permitido.
   - **Paso 3 — Reducir fuente:** Si aun no cabe, disminuir el tamano de fuente progresivamente desde el valor base hasta 8pt (minimo absoluto).
7. En cada paso, el motor re-mide la altura del contenido para verificar si ya cabe.
8. Una vez que el contenido cabe en una pagina, se genera el PDF con la configuracion ajustada.
9. El usuario recibe la descarga del PDF de una sola pagina.
10. No se muestra ningun aviso especial — el autoajuste es transparente.

## Flujos Alternativos

- Si tras aplicar todos los niveles de reduccion (margenes minimos + interlineado minimo + fuente a 8pt) el contenido sigue sin caber → el sistema muestra un aviso: "Tu CV tiene demasiado contenido para una sola pagina, incluso con el ajuste maximo. Desactiva algunas entradas o reduce las descripciones." No se genera el PDF.
- Si el usuario tiene "Limitar a 1 pagina" desactivado → el autoajuste no se ejecuta. Se genera un PDF multi-pagina con la configuracion estandar de la plantilla (comportamiento de F-03 original).
- Si el contenido cabe con la configuracion estandar sin necesidad de ajuste → se genera el PDF normal, sin modificaciones.

## Reglas de Negocio

- La secuencia de reduccion es estricta y en orden: 1ro margenes → 2do interlineado → 3ro fuente. No se salta ningun paso.
- Cada variable tiene un valor base (definido por la plantilla) y un valor minimo:

| Variable | Valor base (plantilla default) | Valor minimo | Paso de reduccion |
| -------- | ------------------------------ | ------------ | ----------------- |
| Margenes de pagina | 15mm (sup, inf, izq, der) | 10mm | 1mm |
| Interlineado (line-height) | 1.5 | 1.15 | 0.05 |
| Tamano de fuente (body) | 11pt | 8pt | 0.5pt |

- Los valores de reduccion de cada variable son proporcionales: si la fuente del body baja a 9pt, los titulos de seccion y encabezados tambien se reducen proporcionalmente manteniendo la jerarquia tipografica.
- El autoajuste se ejecuta exclusivamente en el servidor durante la generacion del PDF. No altera la vista previa en el cliente (la preview siempre muestra la configuracion estandar).
- Si el autoajuste fue necesario, los metadatos de la respuesta del API incluyen los valores finales aplicados (para logging/debugging), pero no se muestran al usuario.
- El autoajuste solo se activa cuando la opcion "Limitar a 1 pagina" esta habilitada. Si esta deshabilitada, se aplica multi-pagina con configuracion estandar.
- El algoritmo de autoajuste agota completamente un nivel antes de pasar al siguiente (ej. no reduce fuente hasta que los margenes ya estan en su minimo y el interlineado ya esta en su minimo).

## Casos de Error (desde la perspectiva del usuario)

- Si el contenido no cabe en 1 pagina incluso con todos los ajustes al minimo → se muestra mensaje: "Tu CV tiene demasiado contenido para una sola pagina, incluso con el ajuste maximo. Desactiva algunas entradas o reduce las descripciones."
- Si el motor de renderizado falla durante el proceso iterativo de ajuste → se muestra el error generico de F-03: "Ocurrio un error al generar tu PDF. Intenta de nuevo en unos minutos."
- Si el timeout de 30 segundos (de F-03) se alcanza durante el proceso iterativo → se muestra: "La generacion del PDF esta tardando mas de lo esperado. Intenta reducir el contenido del CV o intentalo mas tarde."

## Datos Involucrados

### Datos de entrada

- Payload JSON del CV (identico a F-03).
- Opcion `singlePage: true` (activa el autoajuste).
- Configuracion de plantilla con sus valores base.

### Datos de salida

- Archivo binario PDF de exactamente 1 pagina.
- (Interno/debug) Metadatos de ajuste aplicados:
  ```json
  {
    "adjustments": {
      "margins": "12mm",
      "lineHeight": 1.3,
      "fontSize": "9.5pt",
      "wasAdjusted": true
    }
  }
  ```

## APIs Disponibles

### Modificacion al servicio existente: PDF Generation (F-03)

- **Endpoint:** `POST /api/generate-pdf` (mismo de F-03)
- **Cambio en comportamiento:** Cuando `options.singlePage` es `true`, el servidor ejecuta el algoritmo de autoajuste antes de generar el PDF final.
- **Nuevo codigo de error:**
  - `409 CONTENT_OVERFLOW` — El contenido no cabe en 1 pagina ni siquiera con todos los ajustes al minimo. La respuesta incluye:
    ```json
    {
      "error": {
        "code": "CONTENT_OVERFLOW",
        "message": "El contenido excede el espacio disponible incluso con el ajuste maximo.",
        "details": {
          "estimatedPages": 1.4,
          "adjustmentsApplied": {
            "margins": "10mm",
            "lineHeight": 1.15,
            "fontSize": "8pt"
          }
        }
      }
    }
    ```

## Mockups / Wireframes

No disponibles. Desde la perspectiva del usuario, esta feature es invisible: el autoajuste ocurre automaticamente en el servidor. El unico elemento de UI relevante es el toggle "Limitar a 1 pagina" que ya existe en la configuracion de descarga.

## Fuera de Alcance

- NO incluye ajuste visible en la vista previa del cliente (la preview siempre muestra configuracion estandar; el ajuste solo se aplica al PDF final).
- NO incluye control manual del usuario sobre los valores de margenes, interlineado o fuente.
- NO incluye reduccion de contenido automatica (eliminar texto, truncar descripciones). Solo se modifican variables de diseno.
- NO incluye ajuste por seccion (ej. reducir fuente solo en experiencia laboral). El ajuste es global y uniforme.
- NO incluye compresion de espacios entre secciones como variable independiente (se controla indirectamente por el interlineado y margenes internos).

## Criterios de Aceptacion

- [ ] **CA-01:** Cuando `singlePage: true`, el PDF generado tiene exactamente 1 pagina si el contenido cabe tras aplicar la secuencia de autoajuste.
- [ ] **CA-02:** La secuencia de reduccion se aplica en orden estricto: margenes → interlineado → fuente, agotando cada nivel antes de pasar al siguiente.
- [ ] **CA-03:** El tamano de fuente nunca se reduce por debajo de 8pt. Si a 8pt el contenido no cabe, se retorna error `CONTENT_OVERFLOW`.
- [ ] **CA-04:** Si el contenido cabe con la configuracion estandar de la plantilla, el autoajuste no modifica ninguna variable (el PDF es identico al que se generaria sin autoajuste).
- [ ] **CA-05:** La jerarquia tipografica se mantiene proporcionalmente: si la fuente del body se reduce, los titulos y encabezados tambien se reducen en la misma proporcion.
- [ ] **CA-06:** Si `singlePage: false`, el autoajuste no se ejecuta y se genera el PDF multi-pagina con configuracion estandar (comportamiento original de F-03).
- [ ] **CA-07:** El proceso de autoajuste completo (incluyendo las pasadas iterativas de medicion) no excede el timeout de 30 segundos establecido en F-03.

## Casos Borde

- [ ] **CB-01:** El contenido excede la pagina por apenas 1 linea → el autoajuste reduce solo los margenes ligeramente (ej. de 15mm a 14mm) y genera el PDF sin tocar interlineado ni fuente. El resultado es practicamente indistinguible del formato estandar.
- [ ] **CB-02:** El contenido excede la pagina por un 40% → el autoajuste necesita aplicar los tres niveles de reduccion. El PDF resultante tiene fuente a 8pt, interlineado 1.15 y margenes 10mm. Sigue siendo legible pero al limite.
- [ ] **CB-03:** El contenido excede la pagina por mas del 50% con todos los ajustes al minimo → se retorna error `CONTENT_OVERFLOW` con `estimatedPages` indicando cuantas paginas ocuparia (ej. 1.6).
- [ ] **CB-04:** El usuario tiene un CV con una sola entrada pero cuya descripcion es extremadamente larga (2000 caracteres de texto corrido) → el autoajuste funciona igual: reduce variables globales para intentar que quepa.

## Prioridad y Referencias

- **Prioridad:** Alta
- **Ticket:** Por crear
- **Dependencias funcionales:** F-03 (Renderizado PDF — este feature extiende su comportamiento cuando `singlePage: true`)
- **Stakeholder:** Proyecto personal — Alvaro Ybanez

## Notas del Analista

- El autoajuste iterativo requiere multiples pasadas de renderizado en el servidor (renderizar → medir → ajustar → re-renderizar). En el peor caso (3 variables x N pasos cada una), podrian ser ~20+ renderizados. Se recomienda optimizar con busqueda binaria en lugar de decrementos lineales para reducir la cantidad de pasadas.
- Alternativa de implementacion mas eficiente: en lugar de renderizar iterativamente, se puede usar un enfoque de "renderizar una vez a tamano estandar, medir el factor de desbordamiento, y calcular los ajustes necesarios en una sola pasada" usando proporciones. Esto requiere que la relacion entre las variables de diseno y la altura total sea aproximadamente lineal, lo cual es razonable para texto.
- La decision de no reflejar el autoajuste en la vista previa del cliente es deliberada: mantiene la preview como referencia de "diseno ideal" y evita que el usuario se confunda con fuentes que cambian de tamano. Sin embargo, se podria considerar en el futuro un aviso tipo badge en la preview: "El PDF puede tener fuente mas pequena para caber en 1 pagina."
- Este feature modifica el contrato existente de F-03: el `409 CONTENT_OVERFLOW` antes se retornaba cuando el contenido excedia 1 pagina; ahora solo se retorna cuando excede 1 pagina despues de aplicar todos los ajustes al minimo. Actualizar la documentacion de F-03 correspondientemente.
