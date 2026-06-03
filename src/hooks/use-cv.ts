'use client';

import { useReducer, useCallback } from 'react';
import type { CVData, Basics, SectionKey, SectionEntry } from '@/lib/schemas/cv';
import { createEmptyCVData } from '@/lib/schemas/cv';
import { generateId } from '@/lib/utils';

export type CVAction =
  | { type: 'SET_BASICS'; payload: Partial<Basics> }
  | { type: 'SET_ALL'; payload: CVData }
  | { type: 'ADD_ENTRY'; section: SectionKey }
  | { type: 'UPDATE_ENTRY'; section: SectionKey; id: string; updates: Record<string, unknown> }
  | { type: 'REMOVE_ENTRY'; section: SectionKey; id: string }
  | { type: 'TOGGLE_ENTRY'; section: SectionKey; id: string }
  | { type: 'TOGGLE_SECTION'; section: SectionKey; previousStates?: Map<string, boolean> }
  | { type: 'REORDER_ENTRIES'; section: SectionKey; fromIndex: number; toIndex: number };

function createEmptyEntry(section: SectionKey): SectionEntry {
  const id = generateId();
  const base = { id, isActive: true };

  switch (section) {
    case 'work':
      return { ...base, company: '', position: '', summary: '', highlights: [] };
    case 'education':
      return { ...base, institution: '', area: '', studyType: '', score: '', courses: [] };
    case 'skills':
      return { ...base, name: '', level: '', keywords: [] };
    case 'languages':
      return { ...base, language: '', fluency: '' };
    case 'projects':
      return { ...base, name: '', description: '', highlights: [], keywords: [] };
    case 'certifications':
      return { ...base, name: '', issuer: '' };
    case 'volunteer':
      return { ...base, organization: '', position: '', summary: '', highlights: [] };
    case 'publications':
      return { ...base, name: '', publisher: '', summary: '' };
  }
}

function cvReducer(state: CVData, action: CVAction): CVData {
  switch (action.type) {
    case 'SET_BASICS':
      return { ...state, basics: { ...state.basics, ...action.payload } };

    case 'SET_ALL':
      return action.payload;

    case 'ADD_ENTRY': {
      const entry = createEmptyEntry(action.section);
      return { ...state, [action.section]: [...state[action.section], entry] };
    }

    case 'UPDATE_ENTRY': {
      const entries = state[action.section] as SectionEntry[];
      return {
        ...state,
        [action.section]: entries.map((e) =>
          e.id === action.id ? { ...e, ...action.updates } : e,
        ),
      };
    }

    case 'REMOVE_ENTRY': {
      const entries = state[action.section] as SectionEntry[];
      return {
        ...state,
        [action.section]: entries.filter((e) => e.id !== action.id),
      };
    }

    case 'TOGGLE_ENTRY': {
      const entries = state[action.section] as SectionEntry[];
      return {
        ...state,
        [action.section]: entries.map((e) =>
          e.id === action.id ? { ...e, isActive: !e.isActive } : e,
        ),
      };
    }

    case 'TOGGLE_SECTION': {
      const entries = state[action.section] as SectionEntry[];
      if (entries.length === 0) return state;

      if (action.previousStates) {
        return {
          ...state,
          [action.section]: entries.map((e) => ({
            ...e,
            isActive: action.previousStates!.get(e.id) ?? e.isActive,
          })),
        };
      }

      const allActive = entries.every((e) => e.isActive);
      return {
        ...state,
        [action.section]: entries.map((e) => ({ ...e, isActive: !allActive })),
      };
    }

    case 'REORDER_ENTRIES': {
      const entries = [...state[action.section]] as SectionEntry[];
      const { fromIndex, toIndex } = action;
      if (fromIndex < 0 || fromIndex >= entries.length || toIndex < 0 || toIndex >= entries.length) {
        return state;
      }
      const [moved] = entries.splice(fromIndex, 1);
      entries.splice(toIndex, 0, moved);
      return { ...state, [action.section]: entries };
    }
  }
}

export interface UseCVReturn {
  data: CVData;
  dispatch: React.Dispatch<CVAction>;
  setBasics: (updates: Partial<Basics>) => void;
  addEntry: (section: SectionKey) => void;
  updateEntry: (section: SectionKey, id: string, updates: Record<string, unknown>) => void;
  removeEntry: (section: SectionKey, id: string) => void;
  toggleEntry: (section: SectionKey, id: string) => void;
  toggleSection: (section: SectionKey, previousStates?: Map<string, boolean>) => void;
  reorderEntries: (section: SectionKey, fromIndex: number, toIndex: number) => void;
  replaceAll: (data: CVData) => void;
  validate: () => { valid: boolean; errors: Record<string, string> };
}

export function useCV(initialData?: CVData): UseCVReturn {
  const [data, dispatch] = useReducer(cvReducer, initialData ?? createEmptyCVData());

  const setBasics = useCallback((updates: Partial<Basics>) => {
    dispatch({ type: 'SET_BASICS', payload: updates });
  }, []);

  const addEntry = useCallback((section: SectionKey) => {
    dispatch({ type: 'ADD_ENTRY', section });
  }, []);

  const updateEntry = useCallback((section: SectionKey, id: string, updates: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_ENTRY', section, id, updates });
  }, []);

  const removeEntry = useCallback((section: SectionKey, id: string) => {
    dispatch({ type: 'REMOVE_ENTRY', section, id });
  }, []);

  const toggleEntry = useCallback((section: SectionKey, id: string) => {
    dispatch({ type: 'TOGGLE_ENTRY', section, id });
  }, []);

  const toggleSection = useCallback((section: SectionKey, previousStates?: Map<string, boolean>) => {
    dispatch({ type: 'TOGGLE_SECTION', section, previousStates });
  }, []);

  const reorderEntries = useCallback((section: SectionKey, fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_ENTRIES', section, fromIndex, toIndex });
  }, []);

  const replaceAll = useCallback((newData: CVData) => {
    dispatch({ type: 'SET_ALL', payload: newData });
  }, []);

  const validate = useCallback((): { valid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!data.basics.name.trim()) {
      errors['basics.name'] = 'Pestaña "Datos personales": El nombre es obligatorio.';
    }

    if (!data.basics.email && !data.basics.phone.trim()) {
      errors['basics.contact'] = 'Pestaña "Datos personales": Se requiere al menos un dato de contacto (email o teléfono).';
    }

    const sectionKeys: SectionKey[] = ['work', 'education', 'skills', 'languages', 'projects', 'certifications', 'volunteer', 'publications'];
    const hasActiveEntry = sectionKeys.some((key) =>
      (data[key] as SectionEntry[]).some((e) => e.isActive),
    );

    if (!hasActiveEntry) {
      errors['sections'] = 'Se requiere al menos una sección con una entrada activa para poder exportar.';
    }

    return { valid: Object.keys(errors).length === 0, errors };
  }, [data]);

  return {
    data,
    dispatch,
    setBasics,
    addEntry,
    updateEntry,
    removeEntry,
    toggleEntry,
    toggleSection,
    reorderEntries,
    replaceAll,
    validate,
  };
}
