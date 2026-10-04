import { applyCors, handleOptions, apiMeta } from '../../../server/publicApi';

export default function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') {
    applyCors(res);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  applyCors(res);
  return res.status(200).json({
    success: true,
    ...apiMeta(),
    baseUrl: '/api/v1',
    endpoints: {
      health: 'GET /api/v1/health',
      notifications: 'GET /api/v1/notifications',
      notification: 'GET /api/v1/notifications/{id}',
      digest: 'GET /api/v1/digest/today',
      sources: 'GET /api/v1/sources',
      rss: 'GET /api/v1/rss',
    },
    queryParameters: {
      regulator: 'SEBI | RBI | MCA | CBDT | CBIC',
      tag: 'Exact impact tag match',
      search: 'Search title, reference number, summary, raw text and tags',
      urgency: 'CRITICAL | HIGH | MEDIUM | LOW',
      startDate: 'YYYY-MM-DD inclusive',
      endDate: 'YYYY-MM-DD inclusive',
    },
  });
}
