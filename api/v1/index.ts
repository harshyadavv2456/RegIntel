import { GENERATED_DB } from '../../server/data.generated';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  let items = [...GENERATED_DB.notifications];
  const q = req.query || {};
  const regulator = q.regulator ? String(q.regulator).toUpperCase() : undefined;
  const search = q.search ? String(q.search).toLowerCase() : undefined;
  const urgency = q.urgency ? String(q.urgency).toUpperCase() : undefined;
  const tag = q.tag ? String(q.tag).toLowerCase() : undefined;
  const startDate = q.startDate ? String(q.startDate) : undefined;
  const endDate = q.endDate ? String(q.endDate) : undefined;

  if (regulator) items = items.filter((i: any) => i.regulator === regulator);
  if (urgency) items = items.filter((i: any) => i.urgency === urgency);
  if (tag) items = items.filter((i: any) => i.impactTags?.some((t: string) => t.toLowerCase() === tag));
  if (startDate) items = items.filter((i: any) => i.publishDate >= startDate);
  if (endDate) items = items.filter((i: any) => i.publishDate <= endDate);
  if (search) items = items.filter((i: any) =>
    [i.title, i.refNumber, i.aiSummary, i.rawText, i.regulator, ...(i.impactTags || [])]
      .join(' ').toLowerCase().includes(search)
  );

  const sorted = [...items].sort((a: any, b: any) =>
    (String(b.publishDate) + String(b.scrapedAt)).localeCompare(String(a.publishDate) + String(a.scrapedAt))
  );

  const breakdown: Record<string, number> = { SEBI: 0, RBI: 0, MCA: 0, CBDT: 0, CBIC: 0 };
  sorted.forEach((i: any) => { breakdown[i.regulator] = (breakdown[i.regulator] || 0) + 1; });

  const id = q.id ? String(q.id) : undefined;
  const item = id ? GENERATED_DB.notifications.find((n: any) => n.id === id) : undefined;
  if (id && !item) return res.status(404).json({ success: false, error: 'Notification not found' });

  return res.status(200).json({
    success: true,
    api: 'RegIntel Public API',
    version: 'v1',
    generatedAt: GENERATED_DB.notifications[0]?.scrapedAt || null,
    refreshCadence: 'Hourly',
    dataSource: 'Automated regulatory ingestion pipeline',
    coverage: ['SEBI', 'RBI', 'MCA', 'CBDT', 'CBIC'],
    totalAvailable: GENERATED_DB.notifications.length,
    returned: sorted.length,
    regulatorBreakdown: breakdown,
    endpoints: {
      thisFeed: '/api/v1',
      filterExamples: ['/api/v1?regulator=SEBI', '/api/v1?urgency=HIGH', '/api/v1?search=KYC'],
      singleItem: '/api/v1?id={notificationId}',
      tag: '/api/v1?tag=AML/KYC',
      dateRange: '/api/v1?startDate=2026-10-01&endDate=2026-10-04',
    },
    notification: item || null,
    notifications: item ? [] : sorted,
    sources: GENERATED_DB.scraperSources,
    digest: {
      date: new Date().toISOString().slice(0, 10),
      highUrgencyCount: sorted.filter((i: any) => i.urgency === 'HIGH' || i.urgency === 'CRITICAL').length,
      topItems: sorted.slice(0, 15),
    },
  });
}
