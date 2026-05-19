'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCVContext } from '@/providers/cv-provider';
import { slugifyFilename } from '@/lib/utils';

export function ExportButton() {
  const { data } = useCVContext();
  const [exported, setExported] = useState(false);

  const handleExport = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const name = data.basics.name
      ? slugifyFilename(data.basics.name)
      : 'sin_nombre';
    const filename = `CV_${name}_${dateStr}.json`;

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }, [data]);

  return (
    <Button variant="ghost" size="sm" onClick={handleExport}>
      {exported ? 'Exportado!' : 'Exportar'}
    </Button>
  );
}
