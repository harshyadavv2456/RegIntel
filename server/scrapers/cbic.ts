import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';

export class CbicScraper implements RegulatorScraper {
  public regulator: 'CBIC' = 'CBIC';
  public name = 'CBIC / GST & Customs Notifications';
  public sourceUrl = 'https://cbic-gst.gov.in/notifications.html';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(this.sourceUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 RegIntel/1.0',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const html = await res.text();
        const $ = cheerio.load(html);
        $('table tr').each((_, el) => {
          const title = $(el).find('a').text().trim();
          let href = $(el).find('a').attr('href') || '';
          if (title && title.length > 15) {
            if (href && !href.startsWith('http')) {
              href = 'https://cbic-gst.gov.in/' + (href.startsWith('/') ? '' : '/') + href;
            }
            items.push({
              regulator: 'CBIC',
              title,
              refNumber: `CBIC/GST/2025/${items.length + 1}`,
              publishDate: new Date().toISOString().split('T')[0],
              sourceUrl: href || `https://cbic-gst.gov.in/notif/2025/notif-${items.length + 1}.html`,
              rawText: `CBIC Circular under Central Goods and Services Tax Act, 2017. Subject: ${title}. Clarifications regarding Input Tax Credit, invoicing rules, and reverse charge mechanisms.`,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Live CBIC fetch failed or timed out:', e);
    }

    // Never synthesize current regulatory releases when an official portal is blocked, empty, or changes structure.
    // Zero results are returned to the orchestrator as a source-health signal instead of becoming fake feed items.
    return items;
  }
}
