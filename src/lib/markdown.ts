import { sanitizeHTML } from '@/lib/sanitize';

export function markdownToHTML(md: string): string {
  let html = md
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = html.split('\n');
  const output: string[] = [];
  let inList = false;

  for (const line of lines) {
    const listMatch = line.match(/^- (.+)$/);
    if (listMatch) {
      if (!inList) {
        output.push('<ul>');
        inList = true;
      }
      output.push(`<li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        output.push('</ul>');
        inList = false;
      }
      if (line.trim()) {
        output.push(`<p>${line}</p>`);
      }
    }
  }

  if (inList) {
    output.push('</ul>');
  }

  return sanitizeHTML(output.join(''));
}

export function hasMarkdown(text: string): boolean {
  return /\*\*.+?\*\*|\*.+?\*|\[.+?\]\(.+?\)|^- .+/m.test(text);
}
