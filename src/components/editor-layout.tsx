'use client';

import { useState, useEffect } from 'react';
import { useCVContext } from '@/providers/cv-provider';
import { useAutoSave } from '@/hooks/use-auto-save';
import { SectionTabs } from '@/components/ui/section-tabs';
import type { SectionTabItem } from '@/components/ui/section-tabs';
import { SaveIndicator } from '@/components/ui/save-indicator';
import { Button } from '@/components/ui/button';
import { BasicsForm } from '@/components/forms/basics-form';
import { SectionForm } from '@/components/forms/section-form';
import { CVPreview } from '@/components/preview/cv-preview';
import { SECTION_CONFIGS, SECTION_ORDER } from '@/components/forms/section-configs';
import { ImportDialog } from '@/components/import-export/import-dialog';
import { PdfImportDialog } from '@/components/import-export/pdf-import-dialog';
import { AISettingsDialog } from '@/components/import-export/ai-settings-dialog';
import { ExportButton } from '@/components/import-export/export-button';
import { usePdfDownload } from '@/hooks/use-pdf-download';
import { PAGE_FORMATS, PREFERENCES_KEY } from '@/lib/constants';
import type { PageFormat } from '@/lib/constants';
import type { SectionKey, SectionEntry } from '@/lib/schemas/cv';

interface PdfPreferences {
  pageSize: PageFormat;
  singlePage: boolean;
}

function loadPreferences(): PdfPreferences {
  if (typeof window === 'undefined') return { pageSize: 'letter', singlePage: false };
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        pageSize: parsed.pageSize === 'A4' ? 'A4' : 'letter',
        singlePage: Boolean(parsed.singlePage),
      };
    }
  } catch { /* ignore */ }
  return { pageSize: 'letter', singlePage: false };
}

function savePreferences(prefs: PdfPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export function EditorLayout({ initialOpenPdfImport = false }: { initialOpenPdfImport?: boolean }) {
  const { data } = useCVContext();
  const { status, lastSaved } = useAutoSave(data);
  const [activeSection, setActiveSection] = useState<string>('basics');
  const [showPreview, setShowPreview] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showPdfImport, setShowPdfImport] = useState(initialOpenPdfImport);
  const [showAISettings, setShowAISettings] = useState(false);
  const [pageSize, setPageSize] = useState<PageFormat>('letter');
  const [singlePage, setSinglePage] = useState(false);

  useEffect(() => {
    const prefs = loadPreferences();
    setPageSize(prefs.pageSize);
    setSinglePage(prefs.singlePage);
  }, []);

  const updatePageSize = (value: PageFormat) => {
    setPageSize(value);
    savePreferences({ pageSize: value, singlePage });
  };

  const updateSinglePage = (value: boolean) => {
    setSinglePage(value);
    savePreferences({ pageSize, singlePage: value });
  };

  const { download, isLoading: isPdfLoading, error: pdfError } = usePdfDownload({ pageSize, singlePage });

  const tabs: SectionTabItem[] = [
    { key: 'basics', label: 'Datos personales' },
    ...SECTION_ORDER.map((key) => ({
      key,
      label: SECTION_CONFIGS[key].title,
      count: (data[key] as SectionEntry[]).length,
    })),
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">Headless CV</h1>
            <SaveIndicator status={status} lastSaved={lastSaved} />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => updatePageSize(e.target.value as PageFormat)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Formato de página"
            >
              {(Object.keys(PAGE_FORMATS) as PageFormat[]).map((key) => (
                <option key={key} value={key}>
                  {PAGE_FORMATS[key].label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={singlePage}
                onChange={(e) => updateSinglePage(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              1 página
            </label>
            <Button variant="ghost" size="sm" onClick={() => setShowPdfImport(true)}>
              Importar PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowImport(true)}>
              Importar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowAISettings(true)} aria-label="Configurar IA">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Button>
            <ExportButton />
            <Button
              variant="primary"
              size="sm"
              onClick={download}
              disabled={isPdfLoading}
            >
              {isPdfLoading ? 'Generando…' : 'Descargar PDF'}
            </Button>
          </div>
        </div>
      </header>

      {/* PDF error banner */}
      {pdfError && (
        <div className="shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
          {pdfError}
        </div>
      )}

      {/* Tabs */}
      <SectionTabs
        sections={tabs}
        activeSection={activeSection}
        onChange={setActiveSection}
      />

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form panel */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 lg:w-[55%] lg:flex-none">
          <div className="max-w-2xl mx-auto">
            {activeSection === 'basics' ? (
              <BasicsForm />
            ) : (
              <SectionForm
                sectionKey={activeSection as SectionKey}
                config={SECTION_CONFIGS[activeSection as SectionKey]}
              />
            )}
          </div>
        </div>

        {/* Preview panel — desktop only */}
        <div className="hidden lg:flex lg:w-[45%] border-l border-gray-200 bg-gray-100 p-6 overflow-y-auto items-start justify-center">
          <CVPreview data={data} pageFormat={pageSize} />
        </div>
      </div>

      {/* Mobile preview button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowPreview(true)}
          className="rounded-full shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver preview
        </Button>
      </div>

      {/* Mobile preview overlay */}
      {showPreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-100 flex flex-col">
          <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vista previa</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
              Cerrar
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
            <CVPreview data={data} pageFormat={pageSize} />
          </div>
        </div>
      )}

      <ImportDialog open={showImport} onClose={() => setShowImport(false)} />
      <PdfImportDialog
        open={showPdfImport}
        onClose={() => setShowPdfImport(false)}
        onOpenSettings={() => setShowAISettings(true)}
      />
      <AISettingsDialog open={showAISettings} onClose={() => setShowAISettings(false)} />
    </div>
  );
}
