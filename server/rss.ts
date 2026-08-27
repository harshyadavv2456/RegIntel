import { NotificationItem } from '../src/types';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateRssFeedXml(
  items: NotificationItem[],
  options?: {
    appUrl?: string;
    filterDescription?: string;
  }
): string {
  const baseUrl = options?.appUrl || 'https://regintel.ai.studio';
  const buildDate = new Date().toUTCString();
  const title = options?.filterDescription
    ? `RegIntel Feed — ${options.filterDescription}`
    : 'RegIntel Feed — Indian Regulatory Intelligence Digest';
  const description = options?.filterDescription
    ? `Consolidated regulatory intelligence feed filtered by: ${options.filterDescription}`
    : 'Consolidated real-time regulatory intelligence and AI-powered briefs across SEBI, RBI, MCA, CBDT, and CBIC for Indian compliance professionals.';

  const itemXml = items
    .map((item) => {
      const pubDate = new Date(item.publishDate).toUTCString();
      const safeTitle = escapeXml(`[${item.regulator}] ${item.title}`);
      const link = escapeXml(item.sourceUrl);
      const guid = escapeXml(item.id);

      const actionItemsHtml = item.keyActionItems && item.keyActionItems.length > 0
        ? `<h4>Key Action Items</h4><ul>${item.keyActionItems.map((a) => `<li>${escapeXml(a)}</li>`).join('')}</ul>`
        : '';

      const fullContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6;">
          <div style="margin-bottom: 12px; padding: 6px 12px; background-color: #f1f5f9; border-left: 4px solid #0284c7; border-radius: 4px;">
            <strong>Regulator:</strong> ${escapeXml(item.regulator)} &nbsp;|&nbsp;
            <strong>Reference:</strong> ${escapeXml(item.refNumber || 'N/A')} &nbsp;|&nbsp;
            <strong>Urgency:</strong> ${escapeXml(item.urgency || 'MEDIUM')}
          </div>
          <h3 style="color: #0f172a; margin-top: 0;">AI Executive Brief</h3>
          <p style="font-size: 15px; color: #334155;">${escapeXml(item.aiSummary)}</p>
          <div style="margin: 12px 0;">
            <strong>Impact Categories:</strong> ${escapeXml(item.impactTags.join(', '))}
          </div>
          <div style="margin: 12px 0;">
            <strong>Applicable Entities:</strong> ${escapeXml(item.applicableEntities.join(', '))}
          </div>
          ${actionItemsHtml}
          <p><a href="${link}" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline;">View Original Regulator Document &rarr;</a></p>
        </div>
      `.trim();

      const categories = [item.regulator, ...item.impactTags]
        .map((cat) => `<category>${escapeXml(cat)}</category>`)
        .join('\n      ');

      return `
    <item>
      <title>${safeTitle}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${fullContent}]]></description>
      ${categories}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-IN</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <generator>RegIntel Feed Engine 1.0 (Google AI Studio)</generator>
    <atom:link href="${escapeXml(baseUrl)}/api/rss" rel="self" type="application/rss+xml" />
${itemXml}
  </channel>
</rss>`.trim();
}
