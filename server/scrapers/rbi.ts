import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';
import { cleanRowText, extractReference, normalizeUrl, parseDate } from './utils';

export class RbiScraper implements RegulatorScraper {
  public regulator: 'RBI' = 'RBI';
  public name = 'RBI Notifications & Master Directions';
  public sourceUrl = 'https://www.rbi.org.in/Scripts/NotificationUser.aspx';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(this.sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 RegIntel/1.0', 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`RBI returned HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      $('table.tablebg tr, table tr').each((_, el) => {
        const rowText = cleanRowText($(el).text());
        const link = $(el).find('a').filter((_, a) => !cleanRowText($(a).text()).toLowerCase().includes('view pdf')).first();
        const title = cleanRowText(link.text());
        const sourceUrl = normalizeUrl('https://www.rbi.org.in/Scripts/', link.attr('href') || '');
        const publishDate = parseDate(rowText);
        if (!title || title.length < 15 || !sourceUrl || !publishDate) return;
        items.push({ regulator: 'RBI', title, refNumber: extractReference(rowText), publishDate, sourceUrl, rawText: rowText });
      });
    } finally { clearTimeout(timeout); }
    return items;
  }
}
