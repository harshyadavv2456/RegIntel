import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';
import { cleanRowText, extractReference, normalizeUrl, parseDate } from './utils';

export class McaScraper implements RegulatorScraper {
  public regulator: 'MCA' = 'MCA';
  public name = 'MCA Notifications & Updates';
  public sourceUrl = 'https://www.mca.gov.in/content/mca/global/en/home.html';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(this.sourceUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 RegIntel/1.0', 'Accept': 'text/html,application/xhtml+xml' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`MCA returned HTTP ${res.status}`);
      const html = await res.text();
      const $ = cheerio.load(html);

      $('a[href]').each((_, el) => {
        const title = cleanRowText($(el).text());
        const href = $(el).attr('href') || '';
        const parentText = cleanRowText($(el).parent().text());
        const context = cleanRowText($(el).parent().parent().text());
        const rawText = context.length > parentText.length ? context : parentText;
        const publishDate = parseDate(rawText);
        const sourceUrl = normalizeUrl('https://www.mca.gov.in', href);
        const relevant = /notification|circular|amendment|rules|compliance|filing|company|llp/i.test(title);
        if (!relevant || title.length < 15 || !sourceUrl || !publishDate) return;
        if (items.some((item) => item.sourceUrl === sourceUrl)) return;

        items.push({
          regulator: 'MCA',
          title,
          refNumber: extractReference(rawText),
          publishDate,
          sourceUrl,
          rawText,
        });
      });
    } finally {
      clearTimeout(timeout);
    }
    return items;
  }
}
