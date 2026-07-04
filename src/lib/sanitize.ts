import sanitize from 'sanitize-html';

export function sanitizeHTML(input: string): string {
  return sanitize(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'p', 'br'],
    allowedAttributes: {
      a: ['href', 'target', 'rel']
    },
  });
}

export function stripHTML(input: string): string {
  return sanitize(input, { allowedTags: [] });
}
