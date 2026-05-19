'use client';

import { useRef, useCallback } from 'react';
import type { SectionKey, SectionEntry } from '@/lib/schemas/cv';
import { useCVContext } from '@/providers/cv-provider';

export interface UseToggleReturn {
  toggleEntry: (section: SectionKey, id: string) => void;
  toggleSection: (section: SectionKey) => void;
  getSectionState: (section: SectionKey) => 'all' | 'none' | 'mixed';
}

export function useToggle(): UseToggleReturn {
  const { data, toggleEntry: cvToggleEntry, toggleSection: cvToggleSection } = useCVContext();
  const snapshots = useRef<Map<SectionKey, Map<string, boolean>>>(new Map());

  const toggleEntry = useCallback((section: SectionKey, id: string) => {
    cvToggleEntry(section, id);
  }, [cvToggleEntry]);

  const toggleSection = useCallback((section: SectionKey) => {
    const entries = data[section] as SectionEntry[];
    if (entries.length === 0) return;

    const allActive = entries.every((e) => e.isActive);

    if (allActive) {
      const snapshot = new Map<string, boolean>();
      entries.forEach((e) => snapshot.set(e.id, e.isActive));
      snapshots.current.set(section, snapshot);
      cvToggleSection(section);
    } else {
      const allNone = entries.every((e) => !e.isActive);
      if (allNone) {
        const prev = snapshots.current.get(section);
        if (prev) {
          cvToggleSection(section, prev);
          snapshots.current.delete(section);
        } else {
          cvToggleSection(section);
        }
      } else {
        const snapshot = new Map<string, boolean>();
        entries.forEach((e) => snapshot.set(e.id, e.isActive));
        snapshots.current.set(section, snapshot);
        cvToggleSection(section);
      }
    }
  }, [data, cvToggleSection]);

  const getSectionState = useCallback((section: SectionKey): 'all' | 'none' | 'mixed' => {
    const entries = data[section] as SectionEntry[];
    if (entries.length === 0) return 'none';
    const activeCount = entries.filter((e) => e.isActive).length;
    if (activeCount === entries.length) return 'all';
    if (activeCount === 0) return 'none';
    return 'mixed';
  }, [data]);

  return { toggleEntry, toggleSection, getSectionState };
}
