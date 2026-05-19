export function buildCVExtractionPrompt(cvText: string): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `Eres un experto en parsing de currículums vitae (CVs). Tu tarea es extraer información estructurada de un CV en texto plano y retornarla en formato JSON Resume.

RESPONDE ÚNICAMENTE con JSON válido. Sin markdown, sin bloques de código, sin texto adicional antes o después del JSON.

El JSON debe seguir exactamente este esquema:

{
  "basics": {
    "name": "string",
    "label": "string (título profesional)",
    "email": "string",
    "phone": "string",
    "url": "string (sitio web personal)",
    "summary": "string (resumen profesional)",
    "location": {
      "city": "string",
      "country": "string"
    },
    "profiles": [
      {
        "network": "string (ej: LinkedIn, GitHub)",
        "username": "string",
        "url": "string"
      }
    ]
  },
  "work": [
    {
      "company": "string",
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
      "area": "string (campo de estudio)",
      "studyType": "string (ej: Licenciatura, Máster)",
      "startDate": "string (YYYY-MM o YYYY)",
      "endDate": "string (YYYY-MM o YYYY)",
      "score": "string",
      "courses": ["string"]
    }
  ],
  "skills": [
    {
      "name": "string (categoría, ej: Lenguajes de Programación)",
      "level": "string (ej: Avanzado)",
      "keywords": ["string"]
    }
  ],
  "languages": [
    {
      "language": "string",
      "fluency": "string (ej: Nativo, Avanzado, Intermedio)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "highlights": ["string"],
      "keywords": ["string"],
      "startDate": "string (YYYY-MM o YYYY)",
      "endDate": "string (YYYY-MM o YYYY)",
      "url": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string (YYYY-MM o YYYY)",
      "url": "string"
    }
  ],
  "volunteer": [
    {
      "organization": "string",
      "position": "string",
      "startDate": "string (YYYY-MM o YYYY)",
      "endDate": "string (YYYY-MM o YYYY)",
      "summary": "string",
      "highlights": ["string"]
    }
  ],
  "publications": [
    {
      "name": "string",
      "publisher": "string",
      "releaseDate": "string (YYYY-MM o YYYY)",
      "url": "string",
      "summary": "string"
    }
  ]
}

Reglas:
- Los campos de fecha deben usar formato YYYY-MM o YYYY.
- Si no detectas un campo, usa "" para strings y [] para arrays.
- NO inventes datos. Solo extrae lo que está presente en el texto.
- Si una sección no existe en el CV, retorna un array vacío para esa sección.
- Ordena las experiencias y educación de más reciente a más antigua.`;

  const userPrompt = `Extrae los datos del siguiente CV y responde SOLO con JSON válido:

---
${cvText}
---`;

  return { systemPrompt, userPrompt };
}
