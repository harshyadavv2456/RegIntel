import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';
import { cleanRowText, extractReference, normalizeUrl, parseDate } from './utils';

export class CbdtScraper implements RegulatorScraper {
  public regulator: 'CBDT' = 'CBDT';
  public name = 'CBDT / Income Tax Circulars & Orders';
  public sourceUrl = 'https://incometaxindia.gov.in/Pages/communications/circulars.aspx';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(this.sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 RegIntel/1.0', 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`CBDT returned HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      $('table tr').each((_, el) => {
        const rowText = cleanRowText($(el).text());
        const link = $(el).find('a').first();
        const title = cleanRowText(link.text());
        const sourceUrl = normalizeUrl('https://incometaxindia.gov.in', link.attr('href') || '');
        const publishDate = parseDate(rowText);
        if (!title || title.length < 15 || !sourceUrl || !publishDate) return;
        items.push({ regulator: 'CBDT', title, refNumber: extractReference(rowText), publishDate, sourceUrl, rawText: rowText });
      });
    } finally { clearTimeout(timeout); }
    return items;
  }
}
