import type { CVData } from '@/lib/schemas/cv';
import type {
  TemplateDefinition,
  TemplateStyleOptions,
  RenderContext,
} from '../types';

// ── Shared SVG Stars ────────────────────────────────────────────────────

function renderStars(rating: number, max: number = 5): string {
  const stars = [];
  for (let i = 1; i <= max; i++) {
    if (i <= rating) {
      stars.push(`<svg class="star filled" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`);
    } else {
      stars.push(`<svg class="star empty" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`);
    }
  }
  return `<div class="star-rating">${stars.join('')}</div>`;
}

// ── Section Renderers ───────────────────────────────────────────────────

function renderWorkSection(entries: CVData['work'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-company">${ctx.escapeHtml(e.company)}</div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate, true)}</div>
      </div>
      <div class="entry-position">${ctx.escapeHtml(e.position)}</div>
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
        <div class="entry-company">${ctx.escapeHtml(e.institution)}</div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      <div class="entry-position">${ctx.escapeHtml(e.area)}${e.studyType ? ` — ${ctx.escapeHtml(e.studyType)}` : ''}</div>
      ${e.score ? `<div class="entry-description">Nota: ${ctx.escapeHtml(e.score)}</div>` : ''}
    </div>`,
    )
    .join('');
}

function renderSkillsSection(entries: CVData['skills'], ctx: RenderContext): string {
  return `<div class="skills-grid">${entries
    .map(
      (e) =>
        `<div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${ctx.escapeHtml(e.name)}</span>
            ${typeof e.rating === 'number' && e.rating > 0 ? renderStars(e.rating) : (e.level ? `<span class="skill-level">${ctx.escapeHtml(e.level)}</span>` : '')}
          </div>
          ${e.keywords && e.keywords.length > 0 ? `<div class="skill-keywords">${e.keywords.join(', ')}</div>` : ''}
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
        <div class="entry-company">${ctx.escapeHtml(e.name)}${e.url ? ` <a href="${ctx.escapeHtml(e.url)}">[link]</a>` : ''}</div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      ${e.description ? `<div class="entry-description">${ctx.markdownToHTML(e.description)}</div>` : ''}
      ${ctx.renderHighlights(e.highlights)}
    </div>`,
    )
    .join('');
}

function renderCertificationsSection(entries: CVData['certifications'], ctx: RenderContext): string {
  return entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-header">
        <div class="entry-company">${ctx.escapeHtml(e.name)}${e.url ? ` <a href="${ctx.escapeHtml(e.url)}">[link]</a>` : ''}</div>
        <div class="entry-date">${e.date ? ctx.formatDate(e.date) : ''}</div>
      </div>
      ${e.issuer ? `<div class="entry-position">${ctx.escapeHtml(e.issuer)}</div>` : ''}
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
        <div class="entry-company">${ctx.escapeHtml(e.organization)}</div>
        <div class="entry-date">${ctx.renderDateRange(e.startDate, e.endDate)}</div>
      </div>
      <div class="entry-position">${ctx.escapeHtml(e.position)}</div>
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
        <div class="entry-company">${ctx.escapeHtml(e.name)}${e.url ? ` <a href="${ctx.escapeHtml(e.url)}">[ver]</a>` : ''}</div>
        <div class="entry-date">${e.releaseDate ? ctx.formatDate(e.releaseDate) : ''}</div>
      </div>
      <div class="entry-position">${ctx.escapeHtml(e.publisher)}</div>
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

export const creativeTemplate: TemplateDefinition = {
  id: 'creative',
  name: 'Creativo',
  description: 'Diseño visual con soporte para foto de perfil y calificación por estrellas.',

  layout: { type: 'two-column' },
  defaults: { fontSize: 10.5, lineHeight: 1.5, margins: 12 },

  getStyles(options: TemplateStyleOptions): string {
    const { fontSize, margins, lineHeight, pageFormat } = options;
    const pageSize = pageFormat === 'letter' ? '215.9mm 279.4mm' : 'A4';

    const accent = '#0ea5e9'; // Sky blue
    const textPrimary = '#1f2937';
    const textSecondary = '#4b5563';
    const textMuted = '#9ca3af';
    const bgLight = '#f0f9ff';

    const h1Size = (fontSize * 2.2).toFixed(1);
    const labelSize = (fontSize * 1.2).toFixed(1);
    const sectionTitleSize = (fontSize * 1.1).toFixed(1);
    const entryTitleSize = (fontSize * 1.05).toFixed(1);
    const entrySubtitleSize = (fontSize * 0.95).toFixed(1);
    const regularSize = fontSize.toFixed(1);
    const smallSize = (fontSize * 0.85).toFixed(1);

    return `
  @page {
    size: ${pageSize};
    margin: 0;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-wrap: break-word;
  }
  body {
    font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
    font-size: ${regularSize}pt;
    line-height: ${lineHeight};
    color: ${textPrimary};
    margin: 0;
    padding: 0;
  }
  @media screen {
    body {
      padding: 0;
    }
  }
  a {
    color: ${accent};
    text-decoration: none;
  }

  /* ── Layout ─────────────────────────────────────── */
  .cv-layout {
    display: flex;
    align-items: stretch;
    min-height: 100vh;
  }
  .main-column {
    flex: 1;
    min-width: 0;
    padding: ${margins}mm;
  }
  .sidebar-column {
    width: 230pt;
    flex-shrink: 0;
    background: ${bgLight};
    padding: ${margins}mm 15pt;
  }

  /* ── Header ─────────────────────────────────────── */
  header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 20pt;
  }
  .photo {
    width: 90pt;
    height: 90pt;
    border-radius: 50%;
    object-fit: cover;
    border: 3pt solid white;
    box-shadow: 0 2pt 5pt rgba(0,0,0,0.1);
    margin-bottom: 10pt;
  }
  .header-content {
    width: 100%;
  }
  h1 {
    font-size: ${h1Size}pt;
    font-weight: 800;
    color: ${textPrimary};
    line-height: 1.1;
    margin-bottom: 2pt;
  }
  .label {
    font-size: ${labelSize}pt;
    color: ${accent};
    font-weight: 600;
    margin-bottom: 8pt;
  }
  .contact-bar {
    display: flex;
    flex-direction: column;
    gap: 5pt;
    font-size: ${smallSize}pt;
    color: ${textSecondary};
    text-align: left;
    margin-top: 10pt;
    padding-top: 10pt;
    border-top: 1px solid #bae6fd;
  }
  .contact-item {
    display: flex;
    align-items: center;
    gap: 5pt;
    word-break: break-word;
  }

  /* ── Sections ───────────────────────────────────── */
  .section {
    break-inside: auto;
    margin-bottom: 15pt;
  }
  h2 {
    font-size: ${sectionTitleSize}pt;
    font-weight: 700;
    color: ${textPrimary};
    margin-bottom: 10pt;
    display: flex;
    align-items: center;
    gap: 6pt;
    padding-bottom: 4pt;
    border-bottom: 1px solid #e5e7eb;
  }
  h2::before {
    content: '';
    display: block;
    width: 4pt;
    height: 12pt;
    background: ${accent};
    border-radius: 2pt;
  }
  .summary-section {
    margin-bottom: 20pt;
    font-size: ${regularSize}pt;
    color: ${textSecondary};
    line-height: 1.6;
  }
  .summary-section p {
    margin-bottom: 6pt;
  }

  /* ── Entries ────────────────────────────────────── */
  .entry {
    break-inside: avoid;
    margin-bottom: 10pt;
  }
  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1pt;
  }
  .entry-company {
    font-weight: 700;
    font-size: ${entryTitleSize}pt;
    color: ${textPrimary};
  }
  .entry-date {
    font-size: ${smallSize}pt;
    color: ${accent};
    font-weight: 600;
  }
  .entry-position {
    font-size: ${entrySubtitleSize}pt;
    font-weight: 600;
    color: ${textSecondary};
    margin-bottom: 3pt;
  }
  .entry-description {
    font-size: ${regularSize}pt;
    color: ${textSecondary};
  }
  .highlights {
    margin: 4pt 0 0 12pt;
    padding: 0;
    font-size: ${regularSize}pt;
    color: ${textSecondary};
  }
  .highlights li {
    margin-bottom: 2pt;
  }

  /* ── Skills ─────────────────────────────────────── */
  .skills-grid {
    display: flex;
    flex-direction: column;
    gap: 8pt;
  }
  .skill-item {
    break-inside: avoid;
    background: #f9fafb;
    padding: 6pt 8pt;
    border-radius: 6pt;
    border: 1px solid #f3f4f6;
  }
  .skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2pt;
  }
  .skill-name {
    font-weight: 700;
    font-size: ${regularSize}pt;
  }
  .skill-level {
    font-size: ${smallSize}pt;
    color: ${accent};
    font-weight: 600;
  }
  .skill-keywords {
    font-size: ${smallSize}pt;
    color: ${textMuted};
  }

  /* ── Stars ──────────────────────────────────────── */
  .star-rating {
    display: flex;
    gap: 1pt;
  }
  .star {
    width: 10pt;
    height: 10pt;
  }
  .star.filled {
    fill: ${accent};
  }
  .star.empty {
    fill: #d1d5db;
  }

  /* ── Languages ──────────────────────────────────── */
  .languages-list {
    display: flex;
    flex-direction: column;
    gap: 4pt;
  }
  .lang-item {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed #e5e7eb;
    padding-bottom: 2pt;
  }
  .lang-name {
    font-weight: 600;
  }
  .lang-fluency {
    color: ${accent};
    font-weight: 500;
  }`;
  },

  renderHeader(basics, ctx): string {
    const contactParts: string[] = [];
    if (basics.email) contactParts.push(`<div class="contact-item"><span>📧</span> <a href="mailto:${ctx.escapeHtml(basics.email)}">${ctx.escapeHtml(basics.email)}</a></div>`);
    if (basics.phone) contactParts.push(`<div class="contact-item"><span>📱</span> ${ctx.escapeHtml(basics.phone)}</div>`);
    const loc = [basics.location.city, basics.location.country].filter(Boolean).join(', ');
    if (loc) contactParts.push(`<div class="contact-item"><span>📍</span> ${ctx.escapeHtml(loc)}</div>`);
    if (basics.url) contactParts.push(`<div class="contact-item"><span>🌐</span> <a href="${ctx.escapeHtml(basics.url)}">${ctx.escapeHtml(basics.url.replace(/^https?:\/\//, ''))}</a></div>`);

    basics.profiles.forEach(p => {
      if (p.url || p.username) {
        const text = p.network || p.username;
        const link = p.url ? `<a href="${ctx.escapeHtml(p.url)}">${ctx.escapeHtml(text)}</a>` : ctx.escapeHtml(text);
        contactParts.push(`<div class="contact-item"><span>🔗</span> ${link}</div>`);
      }
    });

    const photoHtml = basics.image 
      ? `<img src="${ctx.escapeHtml(basics.image)}" class="photo" alt="Photo" />` 
      : '';

    return `
    <header>
      ${photoHtml}
      <div class="header-content">
        <h1>${ctx.escapeHtml(basics.name)}</h1>
        ${basics.label ? `<div class="label">${ctx.escapeHtml(basics.label)}</div>` : ''}
        ${contactParts.length > 0 ? `<div class="contact-bar">${contactParts.join('')}</div>` : ''}
      </div>
    </header>`;
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
    const mainOrder = ['work', 'education', 'projects', 'volunteer', 'publications'];
    const sidebarOrder = ['skills', 'languages', 'certifications'];

    const summaryHtml = data.basics.summary 
      ? `
      <div class="summary-section">
        <h2>${ctx.escapeHtml(ctx.sectionTitles['summary'] ?? 'Sobre mí')}</h2>
        ${ctx.markdownToHTML(data.basics.summary)}
      </div>` 
      : '';

    const mainSections = mainOrder.map(k => sections[k]).filter(Boolean).join('');
    const sidebarSections = sidebarOrder.map(k => sections[k]).filter(Boolean).join('');

    return `
    <div class="cv-layout">
      <div class="sidebar-column">
        ${header}
        ${sidebarSections}
      </div>
      <div class="main-column">
        ${summaryHtml}
        ${mainSections}
      </div>
    </div>`;
  },
};
