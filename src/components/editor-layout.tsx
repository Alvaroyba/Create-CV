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
import { TailorDialog } from '@/components/import-export/tailor-dialog';
import { ExportButton } from '@/components/import-export/export-button';
import { usePdfDownload } from '@/hooks/use-pdf-download';
import { PAGE_FORMATS, PREFERENCES_KEY } from '@/lib/constants';
import type { PageFormat } from '@/lib/constants';
import type { SectionKey, SectionEntry } from '@/lib/schemas/cv';
import { getAllTemplates } from '@/lib/pdf/templates/registry';

interface PdfPreferences {
  pageSize: PageFormat;
  singlePage: boolean;
  language: 'es' | 'en';
  templateId: string;
}

function loadPreferences(): PdfPreferences {
  if (typeof window === 'undefined') return { pageSize: 'letter', singlePage: false, language: 'es', templateId: 'classic' };
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        pageSize: parsed.pageSize === 'A4' ? 'A4' : 'letter',
        singlePage: Boolean(parsed.singlePage),
        language: parsed.language === 'en' ? 'en' : 'es',
        templateId: typeof parsed.templateId === 'string' ? parsed.templateId : 'classic',
      };
    }
  } catch { /* ignore */ }
  return { pageSize: 'letter', singlePage: false, language: 'es', templateId: 'classic' };
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
  const [showTailor, setShowTailor] = useState(false);
  const [pageSize, setPageSize] = useState<PageFormat>('letter');
  const [singlePage, setSinglePage] = useState(false);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [templateId, setTemplateId] = useState('classic');
  const availableTemplates = getAllTemplates();

  useEffect(() => {
    const prefs = loadPreferences();
    setPageSize(prefs.pageSize);
    setSinglePage(prefs.singlePage);
    setLanguage(prefs.language);
    setTemplateId(prefs.templateId);
  }, []);

  const updatePageSize = (value: PageFormat) => {
    setPageSize(value);
    savePreferences({ pageSize: value, singlePage, language, templateId });
  };

  const updateSinglePage = (value: boolean) => {
    setSinglePage(value);
    savePreferences({ pageSize, singlePage: value, language, templateId });
  };

  const updateLanguage = (value: 'es' | 'en') => {
    setLanguage(value);
    savePreferences({ pageSize, singlePage, language: value, templateId });
  };

  const updateTemplateId = (value: string) => {
    setTemplateId(value);
    savePreferences({ pageSize, singlePage, language, templateId: value });
  };

  const { download, isLoading: isPdfLoading, error: pdfError } = usePdfDownload({ pageSize, singlePage, language, templateId });

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
      <header className="shrink-0 bg-white border-b border-gray-200">
        {/* Accent line */}
        <div className="h-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

        {/* Top row: Branding + Primary actions */}
        <div className="px-4 py-2.5 max-w-screen-2xl mx-auto">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Creador de CV</h1>
              <div className="hidden sm:block">
                <SaveIndicator status={status} lastSaved={lastSaved} />
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Action buttons — icon-only on small, text on md+ */}
              <Button variant="ghost" size="sm" onClick={() => setShowPdfImport(true)} aria-label="Importar PDF" className="!px-2 md:!px-3">
                <svg className="w-4 h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="hidden md:inline">Importar PDF</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowImport(true)} aria-label="Importar JSON" className="!px-2 md:!px-3">
                <svg className="w-4 h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden md:inline">Importar JSON</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowTailor(true)} aria-label="Adaptar CV a oferta laboral" className="!px-2 md:!px-3">
                <svg className="w-4 h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="hidden md:inline">Adaptar a oferta</span>
              </Button>

              <div className="w-px h-5 bg-gray-200 mx-0.5" />

              <Button variant="ghost" size="sm" onClick={() => setShowAISettings(true)} aria-label="Configurar IA" className="!px-2 md:!px-3">
                <svg className="w-4 h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden md:inline">Configuración IA</span>
              </Button>
              <ExportButton />

              <Button
                variant="primary"
                size="sm"
                onClick={download}
                disabled={isPdfLoading}
                className="!px-2.5 md:!px-3"
              >
                <svg className="w-4 h-4 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">{isPdfLoading ? 'Generando…' : 'Descargar PDF'}</span>
                <span className="sm:hidden">{isPdfLoading ? '…' : 'PDF'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom row: Document settings */}
        <div className="px-4 pb-2.5 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Template selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <select
                value={templateId}
                onChange={(e) => updateTemplateId(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 py-0 pl-0 pr-6 cursor-pointer"
                title="Template del CV"
              >
                {availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <select
                value={language}
                onChange={(e) => updateLanguage(e.target.value as 'es' | 'en')}
                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 py-0 pl-0 pr-6 cursor-pointer"
                title="Idioma del CV"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Page format selector */}
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <select
                value={pageSize}
                onChange={(e) => updatePageSize(e.target.value as PageFormat)}
                className="text-sm font-medium text-gray-700 bg-transparent border-none focus:ring-0 py-0 pl-0 pr-6 cursor-pointer"
                title="Formato de página"
              >
                <option value="letter">Carta</option>
                <option value="A4">A4</option>
              </select>
            </div>

            {/* Single page toggle */}
            <label className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={singlePage}
                onChange={(e) => updateSinglePage(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="text-sm font-medium text-gray-700">1 página</span>
            </label>
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
              <BasicsForm templateId={templateId} />
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
          <CVPreview data={data} pageFormat={pageSize} singlePage={singlePage} language={language} templateId={templateId} />
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
            <CVPreview data={data} pageFormat={pageSize} singlePage={singlePage} language={language} templateId={templateId} />
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
      <TailorDialog
        open={showTailor}
        onClose={() => setShowTailor(false)}
        onOpenSettings={() => setShowAISettings(true)}
      />
    </div>
  );
}
