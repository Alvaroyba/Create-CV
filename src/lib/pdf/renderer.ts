import puppeteer from 'puppeteer';
import type { Page } from 'puppeteer';
import type { PageFormat } from '@/lib/constants';
import type { CVData } from '@/lib/schemas/cv';
import { generatePdfHTML, type TemplateOptions } from './template';

export class ContentOverflowError extends Error {
  readonly code = 'CONTENT_OVERFLOW';
  constructor() {
    super('El contenido excede el tamaño de una página. Reduce el contenido o desactiva la opción de página única.');
    this.name = 'ContentOverflowError';
  }
}

export class RenderTimeoutError extends Error {
  readonly code = 'TIMEOUT_ERROR';
  constructor() {
    super('La generación del PDF ha excedido el tiempo límite.');
    this.name = 'RenderTimeoutError';
  }
}

const RENDER_TIMEOUT_MS = 30_000;

const PAGE_HEIGHT_MM: Record<PageFormat, number> = {
  letter: 279.4,
  A4: 297,
};

const MM_TO_PX = 3.7795; // at 96dpi

function usableHeightPx(format: PageFormat, marginMm: number): number {
  return (PAGE_HEIGHT_MM[format] - marginMm * 2) * MM_TO_PX;
}

interface RenderOptions {
  singlePage?: boolean;
  pageFormat?: PageFormat;
  cvData?: CVData;
}

async function measureContentHeight(page: Page, html: string): Promise<number> {
  await page.setContent(html, { waitUntil: 'load' });
  return page.evaluate(() => document.body.scrollHeight);
}

async function generatePdfBuffer(page: Page, format: PageFormat, marginMm: number): Promise<Buffer> {
  const margin = `${marginMm}mm`;
  const pdfBuffer = await page.pdf({
    format: format === 'letter' ? 'Letter' : 'A4',
    printBackground: true,
    margin: { top: margin, bottom: margin, left: margin, right: margin },
  });
  return Buffer.from(pdfBuffer);
}

async function autoFitSinglePage(
  page: Page,
  cvData: CVData,
  format: PageFormat,
): Promise<Buffer> {
  const baseOpts: TemplateOptions = { pageFormat: format };

  // Try with defaults first
  let html = generatePdfHTML(cvData, baseOpts);
  let height = await measureContentHeight(page, html);
  let availableHeight = usableHeightPx(format, 15);

  if (height <= availableHeight) {
    return generatePdfBuffer(page, format, 15);
  }

  // Step 1: Reduce margins (14mm -> 10mm)
  for (let m = 14; m >= 10; m--) {
    html = generatePdfHTML(cvData, { ...baseOpts, margins: m });
    height = await measureContentHeight(page, html);
    availableHeight = usableHeightPx(format, m);
    if (height <= availableHeight) {
      return generatePdfBuffer(page, format, m);
    }
  }

  // Step 2: Reduce line-height (1.45 -> 1.15) with min margins
  for (let lh = 1.45; lh >= 1.15; lh -= 0.05) {
    const lineHeight = Math.round(lh * 100) / 100;
    html = generatePdfHTML(cvData, { ...baseOpts, margins: 10, lineHeight });
    height = await measureContentHeight(page, html);
    availableHeight = usableHeightPx(format, 10);
    if (height <= availableHeight) {
      return generatePdfBuffer(page, format, 10);
    }
  }

  // Step 3: Reduce font-size (10.5pt -> 8pt) with min margins + min line-height
  for (let fs = 10.5; fs >= 8; fs -= 0.5) {
    html = generatePdfHTML(cvData, { ...baseOpts, margins: 10, lineHeight: 1.15, fontSize: fs });
    height = await measureContentHeight(page, html);
    availableHeight = usableHeightPx(format, 10);
    if (height <= availableHeight) {
      return generatePdfBuffer(page, format, 10);
    }
  }

  throw new ContentOverflowError();
}

export async function renderPdf(
  html: string,
  options?: RenderOptions,
): Promise<Buffer> {
  const format: PageFormat = options?.pageFormat ?? 'letter';

  const renderPromise = async (): Promise<Buffer> => {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();

      if (options?.singlePage && options.cvData) {
        return await autoFitSinglePage(page, options.cvData, format);
      }

      await page.setContent(html, { waitUntil: 'load' });
      return await generatePdfBuffer(page, format, 15);
    } finally {
      await browser.close();
    }
  };

  let timeoutId: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new RenderTimeoutError()), RENDER_TIMEOUT_MS);
  });

  return Promise.race([renderPromise(), timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}
