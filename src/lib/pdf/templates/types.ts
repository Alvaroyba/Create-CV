import type { PageFormat } from '@/lib/constants';
import type { CVData, Basics } from '@/lib/schemas/cv';

// ── Render Context ──────────────────────────────────────────────────────
// Shared utilities injected into every template so they don't have to
// re-implement escaping, date formatting, etc.

export interface RenderContext {
  escapeHtml: (str: string) => string;
  markdownToHTML: (md: string) => string;
  formatDate: (date: string) => string;
  renderDateRange: (start?: string, end?: string, showPresent?: boolean) => string;
  renderHighlights: (highlights: string[]) => string;
  sectionTitles: Record<string, string>;
  language: 'es' | 'en';
}

// ── Style Options ───────────────────────────────────────────────────────
// Passed to getStyles() so the template can compute font sizes, margins, etc.

export interface TemplateStyleOptions {
  fontSize: number;
  margins: number;
  lineHeight: number;
  pageFormat: PageFormat;
}

// ── Layout ──────────────────────────────────────────────────────────────

export interface TemplateLayout {
  type: 'single-column' | 'two-column';
}

// ── Defaults ────────────────────────────────────────────────────────────
// Each template declares its preferred defaults; the auto-fit algorithm
// uses these as starting values before progressively reducing them.

export interface TemplateDefaults {
  fontSize: number;
  lineHeight: number;
  margins: number;
}

// ── Template Definition ─────────────────────────────────────────────────

export interface TemplateDefinition {
  /** Unique identifier used in the registry, API payloads, and localStorage. */
  id: string;
  /** Human-readable name shown in the template selector UI. */
  name: string;
  /** Short description for the template selector. */
  description: string;

  layout: TemplateLayout;
  defaults: TemplateDefaults;

  /**
   * Return a complete CSS string for the template.
   * Called once per render with the current style options.
   */
  getStyles: (options: TemplateStyleOptions) => string;

  /**
   * Render the header area (name, contact info, summary).
   * Must return an HTML string.
   */
  renderHeader: (basics: Basics, ctx: RenderContext) => string;

  /**
   * Render a single content section (work, education, skills, etc.).
   * Return an empty string if the section has no data.
   */
  renderSection: (sectionId: string, data: CVData, ctx: RenderContext) => string;

  /**
   * Compose the rendered sections and header into the final body content.
   * \`sections\` is a record mapped by sectionId.
   */
  renderBody: (sections: Record<string, string>, header: string, ctx: RenderContext, data: CVData) => string;
}

// ── Generator Options ───────────────────────────────────────────────────
// Options passed to generatePdfHTML().

export interface GeneratorOptions {
  templateId?: string;
  pageFormat: PageFormat;
  margins?: number;
  lineHeight?: number;
  fontSize?: number;
  language?: 'es' | 'en';
}
