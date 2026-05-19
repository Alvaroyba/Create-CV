# Épica: Headless CV — MVP

## Problema de Negocio

Los editores de currículum tradicionales (WYSIWYG / Drag-and-Drop) generan roturas de diseño frecuentes cuando el usuario edita desde dispositivos móviles o realiza cambios de última hora: márgenes desalineados, fuentes inconsistentes y desbordamientos de página inesperados. Esto provoca frustración, pérdida de tiempo y una imagen profesional comprometida.

Headless CV resuelve este problema separando estrictamente el contenido (datos estructurados) de la presentación (plantillas CSS fijas renderizadas en servidor), garantizando un resultado PDF pixel-perfect independientemente del dispositivo o navegador del usuario.

## Usuario Objetivo

- **Rol:** Profesional en búsqueda activa o pasiva de empleo (sin roles diferenciados ni autenticación).
- **Contexto de uso:** Desde cualquier dispositivo (móvil o escritorio), navegador web moderno. Sin registro previo. Uso recurrente para adaptar el CV a diferentes ofertas laborales.

## Features Hijas (Desglose)

| ID   | Feature                                           | Prioridad |
| ---- | ------------------------------------------------- | --------- |
| F-01 | Formularios Estructurados de CV (con Markdown)    | Alta      |
| F-02 | Feature Flags / Toggles para contenido del CV     | Alta      |
| F-03 | Renderizado y Descarga de PDF Server-Side         | Alta      |
| F-04 | Importación y Exportación de Datos (JSON Resume)  | Media     |

## Modelo de Datos Completo (JSON Resume extendido)

Todas las features comparten este modelo como fuente única de verdad:

- **basics:** name, label, email, phone, url, summary, location (city, country), profiles[]
- **work[]:** company, position, startDate, endDate, summary, highlights[], isActive (toggle)
- **education[]:** institution, area, studyType, startDate, endDate, score, courses[], isActive
- **skills[]:** name, level, keywords[], isActive
- **languages[]:** language, fluency, isActive
- **projects[]:** name, description, highlights[], keywords[], startDate, endDate, url, isActive
- **certifications[]:** name, issuer, date, url, isActive
- **volunteer[]:** organization, position, startDate, endDate, summary, highlights[], isActive
- **publications[]:** name, publisher, releaseDate, url, summary, isActive

## Arquitectura del Sistema

```
+---------------------------------------+
|          CLIENTE (WEB APP)            |
|  - Next.js / React (TypeScript)       |
|  - UI Forms & Toggles (Tailwind CSS)  |
|  - Persistencia: localStorage         |
+---------------------------------------+
                    |
            (JSON Data Payload)
                    v
+---------------------------------------+
|       BACKEND / SERVERLESS API        |
|  - Validación de Esquema (Zod)        |
|  - Inyección en Plantilla Rígida      |
+---------------------------------------+
                    |
         (Compilación Estricta)
                    v
+---------------------------------------+
|          MOTOR DE RENDERIZADO         |
|  - Puppeteer/Playwright               |
|  - Headless Chromium                  |
+---------------------------------------+
                    |
              (Binary PDF)
                    v
       [ DESCARGA PIXEL-PERFECT ]
```

## Estrategia de Inmutabilidad Estética

- **Paginación Controlada:** El motor mide la altura del DOM renderizado contra el formato A4. Saltos de bloque limpios (`break-inside: avoid`).
- **Estilos Fijos:** Tokens de diseño inalterables (fuentes, interlineado, márgenes). El usuario no controla el posicionamiento.
- **Sanitización:** Todo texto se sanitiza para evitar inyecciones HTML o caracteres que rompan el renderizado.

## Fuera de Alcance (Épica MVP)

- NO incluye autenticación, registro de usuarios ni persistencia en la nube.
- NO incluye edición colaborativa ni compartir CV con otros usuarios.
- NO incluye integración directa con LinkedIn, Indeed u otras plataformas de empleo.
- NO incluye generación de carta de presentación (cover letter).
- NO incluye versiones o historial de cambios del CV.
- NO incluye publicación de CV como página web pública (se deja para fase posterior).
- NO incluye más de una plantilla visual en el lanzamiento (la arquitectura lo soportará, pero se lanza con una).

## Orden de Implementación Sugerido

```
F-01 → F-02 → F-04 → F-03
```

**Justificación:** F-01 es fundacional. F-02 se integra naturalmente en los formularios. F-04 (importación JSON) permite probar el flujo completo con datos reales antes de construir el motor de PDF. F-03 es la feature más compleja técnicamente (infraestructura serverless, Puppeteer) y se beneficia de que el resto del sistema ya esté estabilizado.

## Trazabilidad entre Features

| Feature                               | Depende de  | Es dependencia de |
| ------------------------------------- | ----------- | ------------------ |
| F-01 — Formularios Estructurados      | —           | F-02, F-03, F-04   |
| F-02 — Feature Flags / Toggles        | F-01        | F-03               |
| F-03 — Renderizado PDF Server-Side    | F-01, F-02  | —                  |
| F-04 — Importación / Exportación JSON | F-01        | —                  |

## Prioridad y Referencias

- **Prioridad:** Exploratoria — sin fecha fija de entrega
- **Ticket:** Por crear
- **Dependencias funcionales:** Ninguna (proyecto greenfield)
- **Stakeholder:** Proyecto personal — Álvaro Ybáñez

## Notas del Analista

- El modelo de datos se basa en el estándar abierto JSON Resume, extendido con campos `isActive` (boolean) en cada sección iterable para soportar la funcionalidad de Feature Flags.
- La persistencia se resuelve exclusivamente con `localStorage` del navegador. Se asume el riesgo de pérdida de datos si el usuario borra caché; la funcionalidad de exportar JSON mitiga parcialmente este riesgo.
- La decisión de lanzar con una sola plantilla pero con arquitectura extensible implica que el sistema de plantillas debe diseñarse como un contrato de interfaz (la plantilla recibe datos tipados y devuelve HTML/CSS estático).
- El comportamiento de paginación configurable (1 página vs. multi-página) añade complejidad al motor de renderizado; se recomienda implementar primero multi-página con saltos limpios y luego añadir la opción de forzar 1 página como restricción.
