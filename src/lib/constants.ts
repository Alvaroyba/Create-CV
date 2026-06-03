export const STORAGE_KEY = 'headless-cv-data';
export const MAX_ENTRIES = 50;
export const DEBOUNCE_MS = 500;
export const MAX_FIELD_LENGTHS = {
  name: 100,
  label: 120,
  summary: 2000,
  highlight: 500,
  city: 100,
  country: 100,
  company: 100,
  position: 120,
  institution: 100,
  area: 120,
  studyType: 80,
  score: 100,
  skillName: 80,
  skillLevel: 40,
  language: 60,
  fluency: 40,
  projectName: 100,
  certName: 120,
  issuer: 100,
  orgName: 100,
  pubName: 200,
  publisher: 100,
} as const;

export const PAGE_FORMATS = {
  letter: { width: '215.9mm', height: '279.4mm', label: 'Carta (Letter)' },
  A4: { width: '210mm', height: '297mm', label: 'A4' },
} as const;

export type PageFormat = keyof typeof PAGE_FORMATS;

export const PREFERENCES_KEY = 'headless-cv-preferences';
