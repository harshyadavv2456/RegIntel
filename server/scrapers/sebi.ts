import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';
import { cleanRowText, extractReference, normalizeUrl, parseDate } from './utils';

export class SebiScraper implements RegulatorScraper {
  public regulator: 'SEBI' = 'SEBI';
  public name = 'SEBI Legal Circulars & Guidelines';
  public sourceUrl = 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&smid=0&ssid=7';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(this.sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 RegIntel/1.0', 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`SEBI returned HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);
      $('table tr').each((_, el) => {
        const cells = $(el).find('td');
        if (cells.length < 2) return;
        const rowText = cleanRowText($(el).text());
        const dateText = cleanRowText($(cells[0]).text());
        const linkEl = $(cells[1]).find('a').first();
        const title = cleanRowText(linkEl.text() || $(cells[1]).text());
        const sourceUrl = normalizeUrl('https://www.sebi.gov.in', linkEl.attr('href') || '');
        const publishDate = parseDate(dateText || rowText);
        if (!title || title.length < 10 || !sourceUrl || !publishDate) return;
        items.push({ regulator: 'SEBI', title, refNumber: extractReference(rowText), publishDate, sourceUrl, rawText: rowText });
      });
    } finally { clearTimeout(timeout); }
    return items;
  }
}
