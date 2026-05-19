import type { SectionKey } from '@/lib/schemas/cv';
import { MAX_FIELD_LENGTHS } from '@/lib/constants';

export type FieldType = 'text' | 'email' | 'url' | 'date' | 'textarea' | 'list' | 'tags';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  markdownHint?: boolean;
}

export interface SectionConfig {
  sectionKey: SectionKey;
  title: string;
  addLabel: string;
  entryTitle: (entry: Record<string, unknown>) => string;
  fields: FieldConfig[];
}

export const SECTION_ORDER: SectionKey[] = [
  'work',
  'education',
  'skills',
  'languages',
  'projects',
  'certifications',
  'volunteer',
  'publications',
];

export const SECTION_CONFIGS: Record<SectionKey, SectionConfig> = {
  work: {
    sectionKey: 'work',
    title: 'Experiencia Laboral',
    addLabel: 'experiencia',
    entryTitle: (e) => [e.position, e.company].filter(Boolean).join(' en ') || 'Nueva experiencia',
    fields: [
      { name: 'company', label: 'Empresa', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.company },
      { name: 'position', label: 'Puesto', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.position },
      { name: 'startDate', label: 'Fecha inicio', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'endDate', label: 'Fecha fin', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'summary', label: 'Descripción', type: 'textarea', maxLength: MAX_FIELD_LENGTHS.summary, markdownHint: true },
      { name: 'highlights', label: 'Logros destacados', type: 'list' },
    ],
  },
  education: {
    sectionKey: 'education',
    title: 'Educación',
    addLabel: 'educación',
    entryTitle: (e) => [e.area, e.institution].filter(Boolean).join(' — ') || 'Nueva educación',
    fields: [
      { name: 'institution', label: 'Institución', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.institution },
      { name: 'area', label: 'Área de estudio', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.area },
      { name: 'studyType', label: 'Tipo de estudio', type: 'text', maxLength: MAX_FIELD_LENGTHS.studyType },
      { name: 'startDate', label: 'Fecha inicio', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'endDate', label: 'Fecha fin', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'score', label: 'Nota / Promedio', type: 'text', maxLength: MAX_FIELD_LENGTHS.score },
      { name: 'courses', label: 'Cursos relevantes', type: 'list' },
    ],
  },
  skills: {
    sectionKey: 'skills',
    title: 'Habilidades',
    addLabel: 'habilidad',
    entryTitle: (e) => (e.name as string) || 'Nueva habilidad',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.skillName },
      { name: 'level', label: 'Nivel', type: 'text', maxLength: MAX_FIELD_LENGTHS.skillLevel, placeholder: 'Ej: Avanzado' },
      { name: 'keywords', label: 'Tecnologías / Palabras clave', type: 'tags' },
    ],
  },
  languages: {
    sectionKey: 'languages',
    title: 'Idiomas',
    addLabel: 'idioma',
    entryTitle: (e) => (e.language as string) || 'Nuevo idioma',
    fields: [
      { name: 'language', label: 'Idioma', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.language },
      { name: 'fluency', label: 'Nivel', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.fluency, placeholder: 'Ej: Nativo, Fluido, Intermedio' },
    ],
  },
  projects: {
    sectionKey: 'projects',
    title: 'Proyectos',
    addLabel: 'proyecto',
    entryTitle: (e) => (e.name as string) || 'Nuevo proyecto',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.projectName },
      { name: 'description', label: 'Descripción', type: 'textarea', maxLength: MAX_FIELD_LENGTHS.summary, markdownHint: true },
      { name: 'highlights', label: 'Logros destacados', type: 'list' },
      { name: 'keywords', label: 'Tecnologías', type: 'tags' },
      { name: 'startDate', label: 'Fecha inicio', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'endDate', label: 'Fecha fin', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://...' },
    ],
  },
  certifications: {
    sectionKey: 'certifications',
    title: 'Certificaciones',
    addLabel: 'certificación',
    entryTitle: (e) => (e.name as string) || 'Nueva certificación',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.certName },
      { name: 'issuer', label: 'Emisor', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.issuer },
      { name: 'date', label: 'Fecha', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://...' },
    ],
  },
  volunteer: {
    sectionKey: 'volunteer',
    title: 'Voluntariado',
    addLabel: 'voluntariado',
    entryTitle: (e) => [e.position, e.organization].filter(Boolean).join(' en ') || 'Nuevo voluntariado',
    fields: [
      { name: 'organization', label: 'Organización', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.orgName },
      { name: 'position', label: 'Puesto', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.position },
      { name: 'startDate', label: 'Fecha inicio', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'endDate', label: 'Fecha fin', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'summary', label: 'Descripción', type: 'textarea', maxLength: MAX_FIELD_LENGTHS.summary, markdownHint: true },
      { name: 'highlights', label: 'Logros destacados', type: 'list' },
    ],
  },
  publications: {
    sectionKey: 'publications',
    title: 'Publicaciones',
    addLabel: 'publicación',
    entryTitle: (e) => (e.name as string) || 'Nueva publicación',
    fields: [
      { name: 'name', label: 'Título', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.pubName },
      { name: 'publisher', label: 'Editorial / Medio', type: 'text', required: true, maxLength: MAX_FIELD_LENGTHS.publisher },
      { name: 'releaseDate', label: 'Fecha de publicación', type: 'date', placeholder: 'YYYY-MM' },
      { name: 'url', label: 'URL', type: 'url', placeholder: 'https://...' },
      { name: 'summary', label: 'Resumen', type: 'textarea', maxLength: MAX_FIELD_LENGTHS.summary, markdownHint: true },
    ],
  },
};
