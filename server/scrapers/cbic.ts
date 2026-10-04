import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';
import { cleanRowText, extractReference, normalizeUrl, parseDate } from './utils';

export class CbicScraper implements RegulatorScraper {
  public regulator: 'CBIC' = 'CBIC';
  public name = 'CBIC / GST & Customs Notifications';
  public sourceUrl = 'https://cbic-gst.gov.in/notifications.html';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(this.sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 RegIntel/1.0', 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`CBIC returned HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      $('table tr').each((_, el) => {
        const rowText = cleanRowText($(el).text());
        const link = $(el).find('a').first();
        const title = cleanRowText(link.text());
        const sourceUrl = normalizeUrl('https://cbic-gst.gov.in', link.attr('href') || '');
        const publishDate = parseDate(rowText);
        if (!title || title.length < 15 || !sourceUrl || !publishDate) return;
        items.push({ regulator: 'CBIC', title, refNumber: extractReference(rowText), publishDate, sourceUrl, rawText: rowText });
      });
    } finally { clearTimeout(timeout); }
    return items;
  }
}
