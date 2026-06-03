'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import type { CVData, SectionKey } from '@/lib/schemas/cv';
import type { PageFormat } from '@/lib/constants';
import { generatePdfHTML } from '@/lib/pdf/template';

const PAGE_DIMENSIONS_PX = {
  letter: { width: 816, height: 1056 }, // 215.9mm x 279.4mm at 96 DPI
  A4: { width: 793, height: 1122 },     // 210mm x 297mm at 96 DPI
};

interface CVPreviewProps {
  data: CVData;
  pageFormat?: PageFormat;
  singlePage?: boolean;
}

export function CVPreview({ data, pageFormat = 'letter', singlePage = false }: CVPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  // Filter active entries to match the PDF generation logic
  const filteredData = useMemo(() => {
    const fd = { ...data, basics: { ...data.basics } };
    const sectionKeys: SectionKey[] = ['work', 'education', 'skills', 'languages', 'projects', 'certifications', 'volunteer', 'publications'];
    for (const key of sectionKeys) {
      (fd[key] as any) = (data[key] as Array<{ isActive: boolean }>).filter((e) => e.isActive);
    }
    return fd;
  }, [data]);

  // Handle scaling the iframe container to fit the viewport width
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const container = entries[0].target;
      const dims = PAGE_DIMENSIONS_PX[pageFormat];
      // Padding so it doesn't touch the edges
      const availableWidth = container.clientWidth - 32;
      const newScale = Math.min(1, availableWidth / dims.width);
      setScale(newScale);
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [pageFormat]);

  // Handle auto-fit logic
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const dims = PAGE_DIMENSIONS_PX[pageFormat];
    
    // Inject HTML and measure synchronously
    const tryRender = (margins: number, lineHeight: number, fontSize: number): boolean => {
      const html = generatePdfHTML(filteredData, {
        pageFormat,
        margins,
        lineHeight,
        fontSize,
      });
      const doc = iframe.contentDocument;
      if (!doc) return false;
      doc.open();
      doc.write(html);
      doc.close();
      
      const height = doc.body.scrollHeight;
      setContentHeight(height);
      return height <= dims.height;
    };

    let didFit = false;

    if (singlePage) {
      // Step 0: Try defaults
      if (tryRender(15, 1.5, 11)) {
        didFit = true;
      } else {
        // Step 1: Reduce margins
        for (let m = 14; m >= 10 && !didFit; m--) {
          if (tryRender(m, 1.5, 11)) didFit = true;
        }
        // Step 2: Reduce line-height
        for (let lh = 1.45; lh >= 1.15 && !didFit; lh -= 0.05) {
          const lhRounded = Math.round(lh * 100) / 100;
          if (tryRender(10, lhRounded, 11)) didFit = true;
        }
        // Step 3: Reduce font-size
        for (let fs = 10.5; fs >= 8 && !didFit; fs -= 0.5) {
          if (tryRender(10, 1.15, fs)) didFit = true;
        }
      }
      setOverflows(!didFit);
    } else {
      // Just render with defaults and allow scrolling
      tryRender(15, 1.5, 11);
      
      // Delay overflow check to let styles apply
      setTimeout(() => {
        const doc = iframe.contentDocument;
        if (doc) {
          const h = doc.body.scrollHeight;
          setContentHeight(h);
          setOverflows(h > dims.height);
        }
      }, 50);
    }
  }, [filteredData, pageFormat, singlePage]);

  const dims = PAGE_DIMENSIONS_PX[pageFormat];
  const actualHeight = scale * dims.height;

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center w-full h-full overflow-hidden"
    >
      <div className="w-full h-full overflow-y-auto overflow-x-hidden flex justify-center p-4">
        <div 
          className={`bg-white shadow-xl origin-top transition-all duration-200 relative ${overflows ? 'ring-2 ring-red-400' : ''}`}
          style={{
            width: dims.width,
            height: singlePage ? dims.height : (contentHeight > 0 ? contentHeight : 'auto'),
            minHeight: dims.height,
            transform: `scale(${scale})`,
            marginBottom: `${Math.max(0, dims.height - actualHeight)}px`
          }}
        >
          <iframe
            ref={iframeRef}
            title="CV Preview"
            style={{
              width: dims.width,
              height: singlePage ? dims.height : (contentHeight > 0 ? contentHeight : '100%'),
              minHeight: dims.height,
              border: 'none',
              overflow: 'hidden'
            }}
            scrolling="no"
          />
          
          {/* Draw page break indicators if singlePage is false */}
          {!singlePage && contentHeight > dims.height && Array.from({ length: Math.max(0, Math.ceil(contentHeight / dims.height) - 1) }).map((_, i) => (
            <div 
              key={i} 
              className="absolute left-0 right-0 border-t-2 border-dashed border-red-300 pointer-events-none opacity-80 z-20 flex justify-center"
              style={{ top: `${(i + 1) * dims.height}px` }} 
            >
              <span className="bg-red-50 text-red-500 text-xs px-2 py-0.5 rounded-b-md shadow-sm border border-t-0 border-red-200">
                Salto de página
              </span>
            </div>
          ))}
        </div>
      </div>

      {!singlePage && contentHeight > 0 && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-700 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 text-sm font-medium z-10">
          Páginas estimadas: {Math.max(1, Math.ceil(contentHeight / dims.height))}
        </div>
      )}
      
      {overflows && singlePage && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-full shadow-lg text-sm font-medium border border-red-200 z-10">
          El contenido excede una página
        </div>
      )}
    </div>
  );
}
