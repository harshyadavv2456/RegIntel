import { GENERATED_DB } from './data.generated';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store, max-age=0',
};

export function applyCors(res: any) {
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    res.setHeader(key, value);
  }
}

export function handleOptions(req: any, res: any) {
  applyCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function getNotifications(query: Record<string, any> = {}) {
  let items = [...(GENERATED_DB.notifications as any[])];
  const regulator = query.regulator ? String(query.regulator).toUpperCase() : undefined;
  const tag = query.tag ? String(query.tag).toLowerCase() : undefined;
  const search = query.search ? String(query.search).toLowerCase() : undefined;
  const urgency = query.urgency ? String(query.urgency).toUpperCase() : undefined;
  const startDate = query.startDate ? String(query.startDate) : undefined;
  const endDate = query.endDate ? String(query.endDate) : undefined;

  if (regulator) items = items.filter((i) => i.regulator === regulator);
  if (tag) items = items.filter((i) => i.impactTags?.some((t: string) => t.toLowerCase() === tag));
  if (urgency) items = items.filter((i) => i.urgency === urgency);
  if (startDate) items = items.filter((i) => i.publishDate >= startDate);
  if (endDate) items = items.filter((i) => i.publishDate <= endDate);
  if (search) {
    items = items.filter((i) =>
      [i.title, i.refNumber, i.aiSummary, i.rawText, i.regulator, ...(i.impactTags || [])]
        .join(' ')
        .toLowerCase()
        .includes(search)
    );
  }

  return items;
}

export function apiMeta() {
  return {
    api: 'RegIntel Public API',
    version: 'v1',
    description: 'Public Indian regulatory intelligence feed sourced from official SEBI, RBI, MCA, CBDT and CBIC releases.',
    dataMode: 'latest-published-snapshot',
    refreshCadence: 'Every 15 minutes via automated ingestion',
    generatedAt: GENERATED_DB.notifications?.[0]?.scrapedAt || null,
    notificationCount: GENERATED_DB.notifications.length,
  };
}
