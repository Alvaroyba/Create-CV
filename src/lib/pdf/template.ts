import type { CVData } from '@/lib/schemas/cv';
import type { PageFormat } from '@/lib/constants';
import { markdownToHTML } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';

export interface TemplateOptions {
  pageFormat: PageFormat;
  margins?: number;
  lineHeight?: number;
  fontSize?: number;
  language?: 'es' | 'en';
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
        <div class="entry-company">${escapeHtml(e.company)}</div>
        <div class="entry-date">${renderDateRange(e.startDate, e.endDate, true)}</div>
      </div>
      <div class="entry-position">${escapeHtml(e.position)}</div>
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
        <div class="entry-company">${escapeHtml(e.institution)}</div>
        <div class="entry-date">${renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      <div class="entry-position">${escapeHtml(e.area)}${e.studyType ? ` — ${escapeHtml(e.studyType)}` : ''}</div>
      ${e.score ? `<div class="entry-description">${escapeHtml(e.score)}</div>` : ''}
    </div>`,
    )
    .join('');
}

function renderSkillsSection(entries: CVData['skills']): string {
  return `<ul class="highlights">${entries
    .map(
      (e) =>
        `<li><strong>${escapeHtml(e.name)}:</strong> ${e.keywords.map((k) => escapeHtml(k)).join(', ')}${e.level ? ` <span class="entry-level">(${escapeHtml(e.level)})</span>` : ''}</li>`,
    )
    .join('')}</ul>`;
}

function renderLanguagesSection(entries: CVData['languages']): string {
  return `<ul class="highlights">${entries
    .map((e) => `<li><strong>${escapeHtml(e.language)}:</strong> ${escapeHtml(e.fluency)}</li>`)
    .join('')}</ul>`;
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
  return `<ul class="highlights">${entries
    .map(
      (e) =>
        `<li>${e.date ? `${formatDate(e.date)} — ` : ''}<strong>${escapeHtml(e.name)}</strong>${e.issuer ? `, ${escapeHtml(e.issuer)}` : ''}${e.url ? ` <a href="${escapeHtml(e.url)}">[link]</a>` : ''}</li>`,
    )
    .join('')}</ul>`;
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

function renderSection(sectionId: string, data: CVData, sectionTitles: Record<string, string>): string {
  const entries = data[sectionId as keyof CVData];
  if (!entries || (Array.isArray(entries) && entries.length === 0)) return '';
  const render = {
    work: renderWorkSection,
    education: renderEducationSection,
    skills: renderSkillsSection,
    languages: renderLanguagesSection,
    projects: renderProjectsSection,
    certifications: renderCertificationsSection,
    volunteer: renderVolunteerSection,
    publications: renderPublicationsSection,
  }[sectionId] as (e: any) => string;

  return `
    <div class="section">
      <h2 class="section-title">${escapeHtml(sectionTitles[sectionId])}</h2>
      ${render(entries)}
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

export function generatePdfHTML(
  data: CVData,
  options: TemplateOptions = { pageFormat: 'letter', language: 'es' },
): string {
  const { pageFormat, margins = 15, lineHeight = 1.5, fontSize = 11, language = 'es' } = options;
  const sectionTitles = getSectionTitles(language);
  const sections = SECTION_ORDER.map((key) => renderSection(key, data, sectionTitles)).filter(Boolean).join('');

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
    margin: ${margins}mm;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-wrap: break-word;
  }
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: ${fontSize}pt;
    line-height: ${lineHeight};
    color: #1a1a1a;
  }
  @media screen {
    body {
      padding: ${margins}mm;
    }
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
    color: #1a1a1a;
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
  .entry-company {
    font-weight: 700;
    font-size: ${entryTitleSize}pt;
  }
  .entry-position {
    font-size: ${entrySubtitleSize}pt;
    color: #1a1a1a;
    margin-bottom: 2pt;
  }
  .entry-title {
    font-weight: 600;
    font-size: ${entryTitleSize}pt;
  }
  .entry-date {
    font-size: ${entryDateSize}pt;
    color: #4b5563;
    white-space: nowrap;
    margin-left: 8pt;
  }
  .entry-subtitle {
    font-size: ${entrySubtitleSize}pt;
    color: #4b5563;
  }
  .entry-level {
    font-size: ${keywordsSize}pt;
    color: #6b7280;
  }
  .entry-description {
    font-size: ${entryDescSize}pt;
    margin-top: 2pt;
  }
  .entry-description p {
    margin: 0;
  }
  .keywords {
    font-size: ${keywordsSize}pt;
    color: #6b7280;
  }
  .highlights {
    margin: 3pt 0 0 14pt;
    padding: 0;
    font-size: ${highlightsSize}pt;
  }
  .highlights li {
    margin-bottom: 2pt;
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
