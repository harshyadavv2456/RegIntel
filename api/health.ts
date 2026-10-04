import { GENERATED_DB } from '../server/data.generated';

export default function handler(_req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json({
    status: 'ok',
    service: 'RegIntel Feed API',
    itemsCount: GENERATED_DB.notifications.length,
    snapshotScrapedAt: GENERATED_DB.notifications[0]?.scrapedAt || null,
  });
}
