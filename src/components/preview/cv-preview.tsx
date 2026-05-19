'use client';

import { useRef, useState, useEffect } from 'react';
import type { CVData } from '@/lib/schemas/cv';
import type { PageFormat } from '@/lib/constants';
import { PAGE_FORMATS } from '@/lib/constants';
import { PreviewSections } from '@/components/preview/preview-sections';

interface CVPreviewProps {
  data: CVData;
  pageFormat?: PageFormat;
}

export function CVPreview({ data, pageFormat = 'letter' }: CVPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const check = () => {
      setOverflows(content.scrollHeight > container.clientHeight);
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(content);
    return () => observer.disconnect();
  }, [data]);

  const dims = PAGE_FORMATS[pageFormat];
  const aspectW = parseFloat(dims.width);
  const aspectH = parseFloat(dims.height);

  return (
    <div
      ref={containerRef}
      className={`bg-white shadow-lg overflow-y-auto mx-auto ${overflows ? 'ring-2 ring-red-300' : ''}`}
      style={{
        aspectRatio: `${aspectW} / ${aspectH}`,
        maxHeight: '100%',
        width: '100%',
        maxWidth: '595px',
      }}
    >
      <div ref={contentRef} className="p-[15mm]">
        <PreviewSections data={data} />
      </div>
      {overflows && (
        <div className="sticky bottom-0 bg-red-50 text-red-600 text-xs text-center py-1 border-t border-red-200">
          El contenido excede una página
        </div>
      )}
    </div>
  );
}
