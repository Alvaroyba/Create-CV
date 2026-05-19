# Bugfix: BUG-01 — Validacion de URLs Bloquea Importacion JSON

## Problema Reportado

Al intentar importar un archivo JSON Resume valido, el sistema muestra el error:

> Error al importar — Datos invalidos: basics.url: Invalid URL basics.profiles.0.url: Invalid URL basics.profiles.1.url: Invalid URL

Esto bloquea completamente la importacion. El usuario no puede cargar ningun dato aunque el resto del archivo sea correcto.

## Causa Raiz

El esquema de validacion Zod trata los campos de URL (`basics.url`, `profiles[].url`, `projects[].url`, `certifications[].url`, `publications[].url`) como obligatorios con validacion estricta `z.string().url()`. Cuando el archivo JSON importado tiene estos campos vacios (`""`), ausentes o con formatos parciales (ej. `"linkedin.com/in/usuario"` sin protocolo), la validacion falla y bloquea la carga completa del archivo.

## Comportamiento Actual (Incorrecto)

1. El usuario selecciona un archivo JSON valido con URLs vacias o ausentes.
2. La validacion Zod falla en todos los campos URL simultaneamente.
3. Se muestra un error global que bloquea la importacion completa.
4. No se carga ningun dato del archivo.

## Comportamiento Esperado (Correcto)

1. El usuario selecciona un archivo JSON con URLs vacias, ausentes o con formato parcial.
2. Los campos URL se tratan como opcionales: si estan vacios o ausentes, se aceptan como `undefined`/`null`.
3. Si un campo URL tiene un valor que no es una URL valida pero tampoco esta vacio (ej. `"linkedin.com/in/usuario"`), se intenta auto-completar con `https://` y se re-valida. Si sigue siendo invalido, se descarta ese campo especifico con un aviso no bloqueante.
4. El resto de los datos del archivo se importan correctamente.
5. Se muestra un aviso informativo (no bloqueante): "Algunos campos de URL se han omitido por tener formato invalido."

## Cambios en el Esquema de Validacion

Todos los campos de tipo URL en el esquema Zod deben cambiar de:
```typescript
z.string().url()
```
A:
```typescript
z.string().url().optional().or(z.literal(""))
```

Con una transformacion previa que:
1. Si el valor es `""` o `undefined` → lo convierte a `undefined` (campo omitido).
2. Si el valor no tiene protocolo pero parece un dominio valido → antepone `https://` y re-valida.
3. Si tras la transformacion sigue siendo invalido → lo convierte a `undefined` y registra un warning.

## Campos Afectados

- `basics.url`
- `basics.profiles[].url`
- `projects[].url`
- `certifications[].url`
- `publications[].url`

## Criterios de Aceptacion

- [ ] **CA-01:** Un archivo JSON Resume con campos URL vacios (`""`) se importa correctamente sin errores.
- [ ] **CA-02:** Un archivo JSON Resume sin campos URL (ausentes) se importa correctamente sin errores.
- [ ] **CA-03:** Un campo URL con valor parcial (ej. `"linkedin.com/in/usuario"`) se auto-completa con `https://` y se importa correctamente.
- [ ] **CA-04:** Si un campo URL tiene un valor irreparable (ej. `"esto no es una url"`), ese campo especifico se descarta pero el resto del archivo se importa sin bloqueo.
- [ ] **CA-05:** Se muestra un aviso no bloqueante cuando algun campo URL fue omitido o auto-corregido.

## Prioridad y Referencias

- **Prioridad:** Alta (bloquea funcionalidad existente)
- **Ticket:** Por crear
- **Feature afectada:** F-04 — Importacion y Exportacion de Datos
- **Stakeholder:** Proyecto personal — Alvaro Ybanez
