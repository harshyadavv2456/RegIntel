export function normalizeUrl(base: string, href: string): string {
  if (!href) return '';
  try {
    return new URL(href, base).toString();
  } catch {
    return '';
  }
}

export function parseDate(text: string): string | null {
  const value = text.replace(/\s+/g, ' ').trim();
  const patterns = [
    /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/,
    /\b(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})\b/,
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})\b/i,
    /\b(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})\b/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match) continue;
    const parsed = new Date(match[0]);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return null;
}

export function extractReference(text: string): string {
  const value = text.replace(/\s+/g, ' ').trim();
  const patterns = [
    /\b(?:SEBI|RBI)\/[A-Z0-9().-]+(?:\/[A-Z0-9().-]+){1,}\b/i,
    /\b(?:FEMA\s+[^,;]+|F\.No\.[A-Za-z0-9./()\-]+)\b/i,
    /\b(?:Circular|Notification|Order)\s*(?:No\.?|Number)?\s*[A-Za-z0-9./()\-]+/i,
    /\b(?:G\.S\.R\.|S\.O\.)\s*[0-9A-Za-z()./-]+/i,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[0]) return match[0].trim();
  }
  return '';
}

export function cleanRowText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
