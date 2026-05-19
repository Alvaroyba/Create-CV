'use client';

import { useEffect, useState, useRef } from 'react';
import type { CVData } from '@/lib/schemas/cv';
import { saveCV } from '@/lib/storage';
import { DEBOUNCE_MS } from '@/lib/constants';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveReturn {
  status: SaveStatus;
  lastSaved: Date | null;
}

export function useAutoSave(data: CVData): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setStatus('saving');

    const timer = setTimeout(() => {
      const result = saveCV(data);
      if (result.success) {
        setLastSaved(new Date());
        setStatus('saved');
      } else {
        setStatus('error');
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [data]);

  return { status, lastSaved };
}
