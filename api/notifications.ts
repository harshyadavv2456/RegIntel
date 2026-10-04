import { GENERATED_DB } from '../server/data.generated';

export default function handler(req: any, res: any) {
  try {
    const q = req.query || {};
    let items = [...GENERATED_DB.notifications];

    const regulator = q.regulator ? String(q.regulator).toUpperCase() : undefined;
    const tag = q.tag ? String(q.tag).toLowerCase() : undefined;
    const search = q.search ? String(q.search).toLowerCase() : undefined;
    const urgency = q.urgency ? String(q.urgency).toUpperCase() : undefined;
    const startDate = q.startDate ? String(q.startDate) : undefined;
    const endDate = q.endDate ? String(q.endDate) : undefined;

    if (regulator) items = items.filter((i) => i.regulator === regulator);
    if (tag) items = items.filter((i) => i.impactTags.some((t) => t.toLowerCase() === tag));
    if (urgency) items = items.filter((i) => i.urgency === urgency);
    if (startDate) items = items.filter((i) => i.publishDate >= startDate);
    if (endDate) items = items.filter((i) => i.publishDate <= endDate);
    if (search) {
      items = items.filter((i) =>
        [i.title, i.refNumber, i.aiSummary, i.rawText, i.regulator, ...i.impactTags]
          .join(' ')
          .toLowerCase()
          .includes(search)
      );
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json({ success: true, count: items.length, items });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Failed to load notifications' });
  }
}
