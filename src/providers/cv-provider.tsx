'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CVData, Basics, SectionKey } from '@/lib/schemas/cv';
import { createEmptyCVData } from '@/lib/schemas/cv';
import { loadCV } from '@/lib/storage';
import { useCV } from '@/hooks/use-cv';
import type { UseCVReturn } from '@/hooks/use-cv';

interface CVContextValue extends UseCVReturn {
  isLoaded: boolean;
}

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: { children: ReactNode }) {
  const cv = useCV(createEmptyCVData());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = loadCV();
    if (saved) {
      cv.replaceAll(saved);
    }
    setIsLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CVContext.Provider value={{ ...cv, isLoaded }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCVContext(): CVContextValue {
  const ctx = useContext(CVContext);
  if (!ctx) {
    throw new Error('useCVContext must be used within a CVProvider');
  }
  return ctx;
}
