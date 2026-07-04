import type { CVData } from '@/lib/schemas/cv';
import type { GeneratorOptions } from './types';
import { getTemplate } from './registry';
import { createRenderContext } from './render-context';
import { CLASSIC_SECTION_ORDER } from './classic';

// ── Default section order (used when a template doesn't specify its own) ─

const DEFAULT_SECTION_ORDER = CLASSIC_SECTION_ORDER;

// ── Public API ──────────────────────────────────────────────────────────

export function generatePdfHTML(
  data: CVData,
  options: GeneratorOptions = { pageFormat: 'letter' },
): string {
  const {
    templateId = 'classic',
    pageFormat,
    margins,
    lineHeight,
    fontSize,
    language = 'es',
  } = options;

  const template = getTemplate(templateId);

  const effectiveMargins = margins ?? template.defaults.margins;
  const effectiveLineHeight = lineHeight ?? template.defaults.lineHeight;
  const effectiveFontSize = fontSize ?? template.defaults.fontSize;

  const ctx = createRenderContext(language);

  const styles = template.getStyles({
    fontSize: effectiveFontSize,
    margins: effectiveMargins,
    lineHeight: effectiveLineHeight,
    pageFormat,
  });

  const header = template.renderHeader(data.basics, ctx);

  const sectionOrder = DEFAULT_SECTION_ORDER;
  const sectionsRecord: Record<string, string> = {};
  for (const key of sectionOrder) {
    const rendered = template.renderSection(key, data, ctx);
    if (rendered) sectionsRecord[key] = rendered;
  }

  const body = template.renderBody(sectionsRecord, header, ctx, data);

  return wrapInDocument(styles, body, language);
}

// ── Document wrapper ────────────────────────────────────────────────────

function wrapInDocument(
  styles: string,
  body: string,
  language: string,
): string {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
<meta charset="UTF-8">
<style>${styles}</style>
</head>
<body>
${body}
</body>
</html>`;
}

// Re-export types for consumers
export type { GeneratorOptions } from './types';
