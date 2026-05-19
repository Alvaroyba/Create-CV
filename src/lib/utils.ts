import { nanoid } from 'nanoid';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 2) {
    const monthIndex = parseInt(parts[1], 10) - 1;
    const month = MONTH_NAMES[monthIndex] ?? parts[1];
    return `${month} ${parts[0]}`;
  }
  return dateStr;
}

export function slugifyFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

export function generateId(): string {
  return nanoid();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function isDateInFuture(dateStr: string): boolean {
  const now = new Date();
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parts.length === 2 ? parseInt(parts[1], 10) : 1;
  const target = new Date(year, month - 1);
  return target > now;
}

export function isEndDateBeforeStart(start: string, end: string): boolean {
  const normalize = (d: string) => {
    const parts = d.split('-');
    return parts.length === 2 ? d : `${d}-01`;
  };
  return normalize(end) < normalize(start);
}
