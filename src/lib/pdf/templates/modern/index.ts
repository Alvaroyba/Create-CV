import type { CVData } from '@/lib/schemas/cv';
import type {
  TemplateDefinition,
  TemplateStyleOptions,
  RenderContext,
} from '../types';

// ── Section Renderers ───────────────────────────────────────────────────

function renderWorkSection(entries: CVData['work'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <div class="entry-company">${ctx.escapeHtml(e.company)}</div>
          <div class="entry-position">${ctx.escapeHtml(e.position)}</div>
        </div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate, true)}</div>
      </div>
      ${e.summary ? `<div class="entry-description">${ctx.markdownToHTML(e.summary)}</div>` : ''}
      ${ctx.renderHighlights(e.highlights)}
    </div>`,
    )
    .join('');
}

function renderEducationSection(entries: CVData['education'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <div class="entry-company">${ctx.escapeHtml(e.institution)}</div>
          <div class="entry-position">${ctx.escapeHtml(e.area)}${e.studyType ? ` — ${ctx.escapeHtml(e.studyType)}` : ''}</div>
        </div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      ${e.score ? `<div class="entry-description">${ctx.escapeHtml(e.score)}</div>` : ''}
    </div>`,
    )
    .join('');
}

function renderSkillsSection(entries: CVData['skills'], ctx: RenderContext): string {
  return `<div class="skills-grid">${entries
    .map(
      (e) =>
        `<div class="skill-group">
          <div class="skill-name">${ctx.escapeHtml(e.name)}</div>
          <div class="skill-keywords">${e.keywords.map((k) => `<span class="tag">${ctx.escapeHtml(k)}</span>`).join('')}</div>
        </div>`,
    )
    .join('')}</div>`;
}

function renderLanguagesSection(entries: CVData['languages'], ctx: RenderContext): string {
  return `<div class="languages-list">${entries
    .map((e) => `<div class="lang-item"><span class="lang-name">${ctx.escapeHtml(e.language)}</span><span class="lang-fluency">${ctx.escapeHtml(e.fluency)}</span></div>`)
    .join('')}</div>`;
}

function renderProjectsSection(entries: CVData['projects'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <div class="entry-company">${ctx.escapeHtml(e.name)}${e.url ? ` <a href="${ctx.escapeHtml(e.url)}">[link]</a>` : ''}</div>
        </div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      ${e.description ? `<div class="entry-description">${ctx.markdownToHTML(e.description)}</div>` : ''}
      ${ctx.renderHighlights(e.highlights)}
      ${e.keywords.length > 0 ? `<div class="entry-tags">${e.keywords.map((k) => `<span class="tag">${ctx.escapeHtml(k)}</span>`).join('')}</div>` : ''}
    </div>`,
    )
    .join('');
}

function renderCertificationsSection(entries: CVData['certifications'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="cert-item">
      <div class="cert-name">${ctx.escapeHtml(e.name)}${e.url ? ` <a href="${ctx.escapeHtml(e.url)}">[link]</a>` : ''}</div>
      <div class="cert-meta">${e.issuer ? ctx.escapeHtml(e.issuer) : ''}${e.date ? ` · ${ctx.formatDate(e.date)}` : ''}</div>
    </div>`,
    )
    .join('');
}

function renderVolunteerSection(entries: CVData['volunteer'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <div class="entry-company">${ctx.escapeHtml(e.position)}</div>
          <div class="entry-position">${ctx.escapeHtml(e.organization)}</div>
        </div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      ${e.summary ? `<div class="entry-description">${ctx.markdownToHTML(e.summary)}</div>` : ''}
      ${ctx.renderHighlights(e.highlights)}
    </div>`,
    )
    .join('');
}

function renderPublicationsSection(entries: CVData['publications'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-left">
          <div class="entry-company">${ctx.escapeHtml(e.name)}${e.url ? ` <a href="${ctx.escapeHtml(e.url)}">[ver]</a>` : ''}</div>
          <div class="entry-position">${ctx.escapeHtml(e.publisher)}</div>
        </div>
        <div class="entry-date">${e.releaseDate ? ctx.formatDate(e.releaseDate) : ''}</div>
      </div>
      ${e.summary ? `<div class="entry-description">${ctx.markdownToHTML(e.summary)}</div>` : ''}
    </div>`,
    )
    .join('');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_RENDERERS: Record<string, (entries: any, ctx: RenderContext) => string> = {
  work: renderWorkSection,
  education: renderEducationSection,
  skills: renderSkillsSection,
  languages: renderLanguagesSection,
  projects: renderProjectsSection,
  certifications: renderCertificationsSection,
  volunteer: renderVolunteerSection,
  publications: renderPublicationsSection,
};

// ── Template Definition ─────────────────────────────────────────────────

export const modernTemplate: TemplateDefinition = {
  id: 'modern',
  name: 'Moderno',
  description: 'Diseño contemporáneo con acentos de color y tipografía elegante.',

  layout: { type: 'single-column' },
  defaults: { fontSize: 10.5, lineHeight: 1.45, margins: 14 },

  getStyles(options: TemplateStyleOptions): string {
    const { fontSize, margins, lineHeight, pageFormat } = options;
    const pageSize = pageFormat === 'letter' ? '215.9mm 279.4mm' : 'A4';

    const accent = '#2563eb';
    const accentLight = '#dbeafe';
    const textPrimary = '#0f172a';
    const textSecondary = '#475569';
    const textMuted = '#94a3b8';
    const borderColor = '#e2e8f0';

    const h1Size = (fontSize * 2.0).toFixed(1);
    const labelSize = (fontSize * 1.05).toFixed(1);
    const contactSize = (fontSize * 0.82).toFixed(1);
    const summarySize = (fontSize * 0.9).toFixed(1);
    const sectionTitleSize = (fontSize * 0.85).toFixed(1);
    const entryTitleSize = (fontSize * 0.95).toFixed(1);
    const entryDateSize = (fontSize * 0.8).toFixed(1);
    const entrySubtitleSize = (fontSize * 0.85).toFixed(1);
    const entryDescSize = (fontSize * 0.85).toFixed(1);
    const highlightsSize = (fontSize * 0.85).toFixed(1);
    const tagSize = (fontSize * 0.72).toFixed(1);

    return `
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
    color: ${textPrimary};
  }
  @media screen {
    body {
      padding: ${margins}mm;
    }
  }
  a {
    color: ${accent};
    text-decoration: none;
  }

  /* ── Header ─────────────────────────────────────── */
  header {
    margin-bottom: 14pt;
    padding-bottom: 10pt;
    border-bottom: 2pt solid ${accent};
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4pt;
  }
  h1 {
    font-size: ${h1Size}pt;
    font-weight: 800;
    color: ${textPrimary};
    letter-spacing: -0.5pt;
    line-height: 1.1;
  }
  .label {
    font-size: ${labelSize}pt;
    color: ${accent};
    font-weight: 500;
    margin-top: 2pt;
  }
  .contact-block {
    text-align: right;
    font-size: ${contactSize}pt;
    color: ${textSecondary};
    line-height: 1.6;
  }
  .contact-block a {
    color: ${textSecondary};
  }
  .profiles {
    font-size: ${contactSize}pt;
    color: ${textSecondary};
    margin-top: 4pt;
  }
  .profiles a {
    color: ${accent};
  }
  .summary {
    margin-bottom: 10pt;
    font-size: ${summarySize}pt;
    color: ${textSecondary};
  }
  .summary p {
    margin: 0;
  }

  /* ── Sections ───────────────────────────────────── */
  .section {
    break-before: auto;
    margin-bottom: 10pt;
  }
  h2 {
    font-size: ${sectionTitleSize}pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5pt;
    color: ${accent};
    margin-bottom: 6pt;
    padding-bottom: 3pt;
    border-bottom: 1px solid ${borderColor};
  }

  /* ── Entries ────────────────────────────────────── */
  .entry {
    break-inside: avoid;
    margin-bottom: 7pt;
    padding-left: 8pt;
    border-left: 2pt solid ${accentLight};
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  .entry-left {
    flex: 1;
  }
  .entry-company {
    font-weight: 700;
    font-size: ${entryTitleSize}pt;
    color: ${textPrimary};
  }
  .entry-position {
    font-size: ${entrySubtitleSize}pt;
    color: ${textSecondary};
    margin-bottom: 2pt;
  }
  .entry-date {
    font-size: ${entryDateSize}pt;
    color: ${textMuted};
    white-space: nowrap;
    margin-left: 8pt;
    padding-top: 1pt;
  }
  .entry-description {
    font-size: ${entryDescSize}pt;
    margin-top: 2pt;
    color: ${textPrimary};
  }
  .entry-description p {
    margin: 0;
  }
  .highlights {
    margin: 3pt 0 0 10pt;
    padding: 0;
    font-size: ${highlightsSize}pt;
    color: ${textPrimary};
  }
  .highlights li {
    margin-bottom: 2pt;
    position: relative;
    padding-left: 2pt;
  }
  .highlights li::marker {
    color: ${accent};
  }
  .highlights li p {
    display: inline;
    margin: 0;
  }

  /* ── Tags ───────────────────────────────────────── */
  .tag {
    display: inline-block;
    background: ${accentLight};
    color: ${accent};
    font-size: ${tagSize}pt;
    font-weight: 500;
    padding: 1pt 5pt;
    border-radius: 3pt;
    margin: 1pt 2pt 1pt 0;
  }
  .entry-tags {
    margin-top: 3pt;
  }

  /* ── Skills Grid ────────────────────────────────── */
  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6pt;
  }
  .skill-group {
    break-inside: avoid;
    margin-bottom: 4pt;
    flex: 0 0 48%;
  }
  .skill-name {
    font-weight: 600;
    font-size: ${entrySubtitleSize}pt;
    color: ${textPrimary};
    margin-bottom: 2pt;
  }
  .skill-keywords {
    display: flex;
    flex-wrap: wrap;
    gap: 2pt;
  }

  /* ── Languages ──────────────────────────────────── */
  .languages-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6pt 16pt;
  }
  .lang-item {
    display: flex;
    gap: 4pt;
    align-items: baseline;
  }
  .lang-name {
    font-weight: 600;
    font-size: ${entrySubtitleSize}pt;
  }
  .lang-fluency {
    font-size: ${entryDescSize}pt;
    color: ${textSecondary};
  }

  /* ── Certifications ─────────────────────────────── */
  .cert-item {
    break-inside: avoid;
    margin-bottom: 4pt;
    padding-left: 8pt;
    border-left: 2pt solid ${accentLight};
  }
  .cert-name {
    font-weight: 600;
    font-size: ${entrySubtitleSize}pt;
  }
  .cert-meta {
    font-size: ${entryDateSize}pt;
    color: ${textMuted};
  }`;
  },

  renderHeader(basics, ctx): string {
    const contactParts: string[] = [];
    if (basics.email) contactParts.push(`<a href="mailto:${ctx.escapeHtml(basics.email)}">${ctx.escapeHtml(basics.email)}</a>`);
    if (basics.phone) contactParts.push(ctx.escapeHtml(basics.phone));
    if (basics.url) contactParts.push(`<a href="${ctx.escapeHtml(basics.url)}">${ctx.escapeHtml(basics.url)}</a>`);
    const loc = [basics.location.city, basics.location.country].filter(Boolean).join(', ');
    if (loc) contactParts.push(ctx.escapeHtml(loc));

    const profiles = basics.profiles
      .filter((p) => p.url || p.username)
      .map((p) => (p.url ? `<a href="${ctx.escapeHtml(p.url)}">${ctx.escapeHtml(p.network || p.username)}</a>` : ctx.escapeHtml(`${p.network}: ${p.username}`)))
      .join(' · ');

    return `
    <header>
      <div class="header-top">
        <div>
          <h1>${ctx.escapeHtml(basics.name)}</h1>
          ${basics.label ? `<div class="label">${ctx.escapeHtml(basics.label)}</div>` : ''}
        </div>
        ${contactParts.length > 0 ? `<div class="contact-block">${contactParts.join('<br>')}</div>` : ''}
      </div>
      ${profiles ? `<div class="profiles">${profiles}</div>` : ''}
    </header>
    ${basics.summary ? `<div class="summary">${ctx.markdownToHTML(basics.summary)}</div>` : ''}`;
  },

  renderSection(sectionId: string, data: CVData, ctx: RenderContext): string {
    const entries = data[sectionId as keyof CVData];
    if (!entries || (Array.isArray(entries) && entries.length === 0)) return '';

    const render = SECTION_RENDERERS[sectionId];
    if (!render) return '';

    return `
    <div class="section">
      <h2>${ctx.escapeHtml(ctx.sectionTitles[sectionId])}</h2>
      ${render(entries, ctx)}
    </div>`;
  },

  renderBody(sections: Record<string, string>, header: string, ctx: RenderContext, data: CVData): string {
    const sectionOrder = ['work', 'education', 'skills', 'languages', 'projects', 'certifications', 'volunteer', 'publications'];
    const orderedSections = sectionOrder.map((k) => sections[k]).filter(Boolean);
    return header + orderedSections.join('');
  },
};
