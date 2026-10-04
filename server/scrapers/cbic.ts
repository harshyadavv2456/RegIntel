import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';
import { cleanRowText, extractReference, normalizeUrl, parseDate } from './utils';

export class CbicScraper implements RegulatorScraper {
  public regulator: 'CBIC' = 'CBIC';
  public name = 'CBIC Tax Information Portal';
  public sourceUrl = 'https://taxinformation.cbic.gov.in/';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(this.sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 RegIntel/1.0', 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`CBIC Tax Information Portal returned HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);

      $('a[href]').each((_, el) => {
        const title = cleanRowText($(el).text());
        const href = $(el).attr('href') || '';
        const context = cleanRowText($(el).parent().parent().text() || $(el).parent().text());
        const publishDate = parseDate(context);
        const sourceUrl = normalizeUrl('https://taxinformation.cbic.gov.in', href);
        const relevant = /notification|circular|order|instruction|clarification/i.test(title);
        if (!relevant || title.length < 15 || !sourceUrl || !publishDate) return;
        if (items.some((item) => item.sourceUrl === sourceUrl)) return;

        items.push({
          regulator: 'CBIC',
          title,
          refNumber: extractReference(context),
          publishDate,
          sourceUrl,
          rawText: context,
        });
      });
    } finally {
      clearTimeout(timeout);
    }
    return items;
  }
}
