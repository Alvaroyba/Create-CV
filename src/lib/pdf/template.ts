import type { CVData } from '@/lib/schemas/cv';
import type { PageFormat } from '@/lib/constants';
import { markdownToHTML } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';

export interface TemplateOptions {
  pageFormat: PageFormat;
  margins?: number;
  lineHeight?: number;
  fontSize?: number;
}

const SECTION_ORDER = [
  'work',
  'education',
  'skills',
  'languages',
  'projects',
  'certifications',
  'volunteer',
  'publications',
] as const;

const SECTION_TITLES: Record<string, string> = {
  work: 'Experiencia Profesional',
  education: 'Educación',
  skills: 'Habilidades',
  languages: 'Idiomas',
  projects: 'Proyectos',
  certifications: 'Certificaciones',
  volunteer: 'Voluntariado',
  publications: 'Publicaciones',
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderDateRange(start?: string, end?: string, showPresent = false): string {
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

function renderHighlights(highlights: string[]): string {
  const active = highlights.filter((h) => h.trim());
  if (active.length === 0) return '';
  return `<ul class="highlights">${active.map((h) => `<li>${markdownToHTML(h)}</li>`).join('')}</ul>`;
}

function renderWorkSection(entries: CVData['work']): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(e.position)}</div>
        <div class="entry-date">${renderDateRange(e.startDate, e.endDate, true)}</div>
      </div>
      <div class="entry-subtitle">${escapeHtml(e.company)}</div>
      ${e.summary ? `<div class="entry-description">${markdownToHTML(e.summary)}</div>` : ''}
      ${renderHighlights(e.highlights)}
    </div>`,
    )
    .join('');
}

function renderEducationSection(entries: CVData['education']): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(e.area)}${e.studyType ? ` — ${escapeHtml(e.studyType)}` : ''}</div>
        <div class="entry-date">${renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      <div class="entry-subtitle">${escapeHtml(e.institution)}${e.score ? ` · ${escapeHtml(e.score)}` : ''}</div>
    </div>`,
    )
    .join('');
}

function renderSkillsSection(entries: CVData['skills']): string {
  return entries
    .map(
      (e) => `
    <div class="entry entry-inline">
      <span class="entry-title">${escapeHtml(e.name)}${e.level ? ` (${escapeHtml(e.level)})` : ''}</span>
      <span class="keywords">${e.keywords.map((k) => escapeHtml(k)).join(', ')}</span>
    </div>`,
    )
    .join('');
}

function renderLanguagesSection(entries: CVData['languages']): string {
  return entries
    .map(
      (e) => `
    <div class="entry entry-inline">
      <span class="entry-title">${escapeHtml(e.language)}</span>
      <span class="keywords">${escapeHtml(e.fluency)}</span>
    </div>`,
    )
    .join('');
}

function renderProjectsSection(entries: CVData['projects']): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(e.name)}${e.url ? ` <a href="${escapeHtml(e.url)}">[link]</a>` : ''}</div>
        <div class="entry-date">${renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      ${e.description ? `<div class="entry-description">${markdownToHTML(e.description)}</div>` : ''}
      ${renderHighlights(e.highlights)}
      ${e.keywords.length > 0 ? `<div class="keywords">${e.keywords.map((k) => escapeHtml(k)).join(', ')}</div>` : ''}
    </div>`,
    )
    .join('');
}

function renderCertificationsSection(entries: CVData['certifications']): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(e.name)}${e.url ? ` <a href="${escapeHtml(e.url)}">[ver]</a>` : ''}</div>
        <div class="entry-date">${e.date ? formatDate(e.date) : ''}</div>
      </div>
      <div class="entry-subtitle">${escapeHtml(e.issuer)}</div>
    </div>`,
    )
    .join('');
}

function renderVolunteerSection(entries: CVData['volunteer']): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(e.position)}</div>
        <div class="entry-date">${renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      <div class="entry-subtitle">${escapeHtml(e.organization)}</div>
      ${e.summary ? `<div class="entry-description">${markdownToHTML(e.summary)}</div>` : ''}
      ${renderHighlights(e.highlights)}
    </div>`,
    )
    .join('');
}

function renderPublicationsSection(entries: CVData['publications']): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-title">${escapeHtml(e.name)}${e.url ? ` <a href="${escapeHtml(e.url)}">[ver]</a>` : ''}</div>
        <div class="entry-date">${e.releaseDate ? formatDate(e.releaseDate) : ''}</div>
      </div>
      <div class="entry-subtitle">${escapeHtml(e.publisher)}</div>
      ${e.summary ? `<div class="entry-description">${markdownToHTML(e.summary)}</div>` : ''}
    </div>`,
    )
    .join('');
}

function renderSection(key: string, data: CVData): string {
  const entries = data[key as keyof CVData];
  if (!Array.isArray(entries) || entries.length === 0) return '';

  const renderers: Record<string, (items: never[]) => string> = {
    work: renderWorkSection as (items: never[]) => string,
    education: renderEducationSection as (items: never[]) => string,
    skills: renderSkillsSection as (items: never[]) => string,
    languages: renderLanguagesSection as (items: never[]) => string,
    projects: renderProjectsSection as (items: never[]) => string,
    certifications: renderCertificationsSection as (items: never[]) => string,
    volunteer: renderVolunteerSection as (items: never[]) => string,
    publications: renderPublicationsSection as (items: never[]) => string,
  };

  const renderer = renderers[key];
  if (!renderer) return '';

  return `
    <div class="section">
      <h2>${SECTION_TITLES[key]}</h2>
      ${renderer(entries as never[])}
    </div>`;
}

function renderHeader(basics: CVData['basics']): string {
  const contactParts: string[] = [];
  if (basics.email) contactParts.push(`<a href="mailto:${escapeHtml(basics.email)}">${escapeHtml(basics.email)}</a>`);
  if (basics.phone) contactParts.push(escapeHtml(basics.phone));
  if (basics.url) contactParts.push(`<a href="${escapeHtml(basics.url)}">${escapeHtml(basics.url)}</a>`);
  const loc = [basics.location.city, basics.location.country].filter(Boolean).join(', ');
  if (loc) contactParts.push(escapeHtml(loc));

  const profiles = basics.profiles
    .filter((p) => p.url || p.username)
    .map((p) => (p.url ? `<a href="${escapeHtml(p.url)}">${escapeHtml(p.network || p.username)}</a>` : escapeHtml(`${p.network}: ${p.username}`)))
    .join(' · ');

  return `
    <header>
      <h1>${escapeHtml(basics.name)}</h1>
      ${basics.label ? `<div class="label">${escapeHtml(basics.label)}</div>` : ''}
      ${contactParts.length > 0 ? `<div class="contact">${contactParts.join(' | ')}</div>` : ''}
      ${profiles ? `<div class="profiles">${profiles}</div>` : ''}
    </header>
    ${basics.summary ? `<div class="summary">${markdownToHTML(basics.summary)}</div>` : ''}`;
}

export function generatePdfHTML(data: CVData, options?: TemplateOptions): string {
  const sections = SECTION_ORDER.map((key) => renderSection(key, data)).filter(Boolean).join('');

  const pageFormat = options?.pageFormat ?? 'letter';
  const margins = options?.margins ?? 15;
  const lineHeight = options?.lineHeight ?? 1.5;
  const fontSize = options?.fontSize ?? 11;

  const pageSize = pageFormat === 'letter' ? '215.9mm 279.4mm' : 'A4';

  const h1Size = (fontSize * 1.82).toFixed(1);
  const h2Size = (fontSize * 1.0).toFixed(1);
  const labelSize = (fontSize * 1.0).toFixed(1);
  const contactSize = (fontSize * 0.82).toFixed(1);
  const summarySize = (fontSize * 0.86).toFixed(1);
  const entryTitleSize = (fontSize * 0.91).toFixed(1);
  const entryDateSize = (fontSize * 0.82).toFixed(1);
  const entrySubtitleSize = (fontSize * 0.86).toFixed(1);
  const entryDescSize = (fontSize * 0.86).toFixed(1);
  const highlightsSize = (fontSize * 0.86).toFixed(1);
  const keywordsSize = (fontSize * 0.82).toFixed(1);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  @page {
    size: ${pageSize};
    margin: 0;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: ${fontSize}pt;
    line-height: ${lineHeight};
    color: #1a1a1a;
    padding: ${margins}mm;
  }
  a {
    color: #2563eb;
    text-decoration: none;
  }
  header {
    text-align: center;
    margin-bottom: 12pt;
  }
  h1 {
    font-size: ${h1Size}pt;
    font-weight: 700;
    margin-bottom: 2pt;
  }
  .label {
    font-size: ${labelSize}pt;
    color: #4b5563;
    margin-bottom: 4pt;
  }
  .contact {
    font-size: ${contactSize}pt;
    color: #6b7280;
    margin-bottom: 2pt;
  }
  .profiles {
    font-size: ${contactSize}pt;
    color: #6b7280;
  }
  .summary {
    margin-bottom: 10pt;
    font-size: ${summarySize}pt;
    color: #374151;
    border-left: 2px solid #e5e5e5;
    padding-left: 8pt;
  }
  .summary p {
    margin: 0;
  }
  .section {
    break-before: auto;
    margin-bottom: 10pt;
  }
  h2 {
    font-size: ${h2Size}pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
    border-bottom: 1px solid #e5e5e5;
    padding-bottom: 3pt;
    margin-bottom: 6pt;
    color: #1a1a1a;
  }
  .entry {
    break-inside: avoid;
    margin-bottom: 6pt;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .entry-title {
    font-weight: 600;
    font-size: ${entryTitleSize}pt;
  }
  .entry-date {
    font-size: ${entryDateSize}pt;
    color: #6b7280;
    white-space: nowrap;
    margin-left: 8pt;
  }
  .entry-subtitle {
    font-size: ${entrySubtitleSize}pt;
    color: #4b5563;
  }
  .entry-description {
    font-size: ${entryDescSize}pt;
    margin-top: 2pt;
  }
  .entry-description p {
    margin: 0;
  }
  .entry-inline {
    display: flex;
    gap: 6pt;
    align-items: baseline;
    margin-bottom: 3pt;
  }
  .entry-inline .entry-title {
    font-weight: 600;
    white-space: nowrap;
  }
  .entry-inline .entry-title::after {
    content: ':';
  }
  .keywords {
    font-size: ${keywordsSize}pt;
    color: #6b7280;
  }
  .highlights {
    margin: 2pt 0 0 14pt;
    padding: 0;
    font-size: ${highlightsSize}pt;
  }
  .highlights li {
    margin-bottom: 1pt;
  }
  .highlights li p {
    display: inline;
    margin: 0;
  }
</style>
</head>
<body>
${renderHeader(data.basics)}
${sections}
</body>
</html>`;
}
