import type { CVData } from '@/lib/schemas/cv';

/**
 * Builds a prompt for adapting an existing CV to match a job offer.
 * Conservative approach: maintains structure, adjusts wording/keywords.
 */
export function buildCVTailorPrompt(cvData: CVData, jobOffer: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `Eres un experto en recursos humanos y optimización de currículums vitae. Tu tarea es adaptar un CV existente para que sea más relevante para una oferta de trabajo específica.

ENFOQUE CONSERVADOR:
- MANTÉN toda la estructura existente del CV (mismas secciones, mismas entradas).
- MANTÉN todos los datos personales exactamente iguales (nombre, email, teléfono, ubicación, perfiles).
- MANTÉN las fechas exactamente iguales.
- MANTÉN los nombres de empresas, instituciones y posiciones exactamente iguales.
- NO inventes experiencias, proyectos, certificaciones o habilidades que no existan en el CV original.
- NO elimines ninguna entrada del CV.

LO QUE SÍ PUEDES MODIFICAR:
- El "label" (título profesional) para que sea más relevante a la oferta.
- El "summary" (resumen profesional) para destacar lo más relevante para esta oferta.
- Los "highlights" de cada experiencia laboral para enfatizar logros relevantes al puesto.
- Los "keywords" de skills y proyectos para incluir tecnologías/habilidades mencionadas en la oferta (solo si son plausibles dado el perfil).
- El "level" de habilidades si es razonable ajustarlo.
- Las descripciones de proyectos para enfatizar aspectos relevantes.

RESPONDE ÚNICAMENTE con JSON válido. Sin markdown, sin bloques de código, sin texto adicional.

El JSON debe seguir exactamente el mismo esquema que el CV de entrada (JSON Resume).`;

  const userPrompt = `Adapta el siguiente CV para que sea más relevante para la oferta de trabajo descrita abajo.

--- CV ACTUAL (JSON) ---
${JSON.stringify(cvData, null, 2)}

--- OFERTA DE TRABAJO ---
${jobOffer}

--- INSTRUCCIONES ---
Retorna el CV adaptado como JSON válido, manteniendo EXACTAMENTE la misma estructura. Solo ajusta el contenido textual para que sea más relevante a la oferta.`;

  return { systemPrompt, userPrompt };
}

/**
 * Builds a prompt for generating a generic CV from a job offer when no CV is loaded.
 */
export function buildCVGenerateFromOfferPrompt(jobOffer: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `Eres un experto en recursos humanos y creación de currículums vitae. Tu tarea es generar un CV de ejemplo/plantilla que sea ideal para una oferta de trabajo específica.

REGLAS:
- Genera un CV completo y realista que sería ideal para la oferta descrita.
- Los datos personales deben quedar VACÍOS (nombre: "", email vacío, teléfono: "", etc.) para que el usuario los complete.
- Las fechas de experiencias deben ser plausibles pero genéricas (ej: "2020", "2022-06").
- Genera entre 2-3 experiencias laborales relevantes.
- Genera 1-2 entradas de educación relevantes.
- Genera skills relevantes con keywords apropiadas.
- Genera 1-2 proyectos relevantes si aplica.
- Los highlights deben ser logros cuantificables y relevantes.
- Todo el contenido debe estar en español a menos que la oferta esté en otro idioma.

RESPONDE ÚNICAMENTE con JSON válido. Sin markdown, sin bloques de código, sin texto adicional.

El JSON debe seguir exactamente este esquema:

{
  "basics": {
    "name": "",
    "label": "string (título profesional ideal para la oferta)",
    "email": "",
    "phone": "",
    "url": "",
    "summary": "string (resumen profesional ideal para la oferta)",
    "location": { "city": "", "country": "" },
    "profiles": []
  },
  "work": [
    {
      "company": "string (nombre de empresa ficticia pero realista)",
      "position": "string",
      "startDate": "string (YYYY-MM o YYYY)",
      "endDate": "string (YYYY-MM o YYYY, vacío si es actual)",
      "summary": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "area": "string",
      "studyType": "string",
      "startDate": "string",
      "endDate": "string",
      "score": "",
      "courses": []
    }
  ],
  "skills": [
    {
      "name": "string (categoría)",
      "level": "string",
      "keywords": ["string"]
    }
  ],
  "languages": [
    {
      "language": "string",
      "fluency": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "highlights": ["string"],
      "keywords": ["string"],
      "startDate": "string",
      "endDate": "string",
      "url": ""
    }
  ],
  "certifications": [],
  "volunteer": [],
  "publications": []
}`;

  const userPrompt = `Genera un CV de ejemplo/plantilla ideal para la siguiente oferta de trabajo. Los datos personales deben quedar vacíos para que el usuario los complete. Responde SOLO con JSON válido.

--- OFERTA DE TRABAJO ---
${jobOffer}`;

  return { systemPrompt, userPrompt };
}
