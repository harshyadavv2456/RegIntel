import { applyCors, handleOptions, apiMeta } from '../../server/publicApi';

export default function handler(req: any, res: any) {
  if (handleOptions(req, res)) return;
  applyCors(res);
  return res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    ...apiMeta(),
  });
}
