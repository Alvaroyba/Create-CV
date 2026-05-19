import { STORAGE_KEY } from '@/lib/constants';
import { CVDataSchema } from '@/lib/schemas/cv';
import type { CVData } from '@/lib/schemas/cv';

export function loadCV(): CVData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const result = CVDataSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function saveCV(data: CVData): { success: boolean; error?: string } {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Cannot access localStorage on the server' };
  }
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      return { success: false, error: 'Storage quota exceeded' };
    }
    return { success: false, error: 'Failed to save data' };
  }
}

export function clearCV(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasExistingData(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}
