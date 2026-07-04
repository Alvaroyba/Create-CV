import { markdownToHTML } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import type { RenderContext } from './types';

// ── Section Titles ──────────────────────────────────────────────────────

const SECTION_TITLES_EN: Record<string, string> = {
  work: 'Professional Experience',
  education: 'Education',
  skills: 'Additional Skills',
  languages: 'Languages',
  projects: 'Projects',
  certifications: 'Certifications',
  volunteer: 'Volunteer',
  publications: 'Publications',
};

const SECTION_TITLES_ES: Record<string, string> = {
  work: 'Experiencia Profesional',
  education: 'Educación',
  skills: 'Habilidades Adicionales',
  languages: 'Idiomas',
  projects: 'Proyectos',
  certifications: 'Certificaciones',
  volunteer: 'Voluntariado',
  publications: 'Publicaciones',
};

function getSectionTitles(language: 'es' | 'en'): Record<string, string> {
  return language === 'es' ? SECTION_TITLES_ES : SECTION_TITLES_EN;
}

// ── Shared Utilities ────────────────────────────────────────────────────

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderDateRange(start?: string, end?: string, showPresent = false): string {
  if (!start && !end) return '';
  const parts: string[] = [];
  if (start) parts.push(formatDate(start));
  if (end) {
    parts.push(formatDate(end));
  } else if (showPresent && start) {
    parts.push('Actualmente');
  }
  return parts.join(' — ');
}

export function renderHighlights(highlights: string[]): string {
  const active = highlights.filter((h) => h.trim());
  if (active.length === 0) return '';
  return `<ul class="highlights">${active.map((h) => `<li>${markdownToHTML(h)}</li>`).join('')}</ul>`;
}

// ── Factory ─────────────────────────────────────────────────────────────

export function createRenderContext(language: 'es' | 'en'): RenderContext {
  return {
    escapeHtml,
    markdownToHTML,
    formatDate,
    renderDateRange,
    renderHighlights,
    sectionTitles: getSectionTitles(language),
    language,
  };
}
