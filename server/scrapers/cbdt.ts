import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';
import { cleanRowText, extractReference, normalizeUrl, parseDate } from './utils';

export class CbdtScraper implements RegulatorScraper {
  public regulator: 'CBDT' = 'CBDT';
  public name = 'CBDT Circular RSS';
  public sourceUrl = 'https://www.incometaxindia.gov.in/circular-rss-feed/-/asset_publisher/bxhj/rss';

  public async scrape(): Promise<RawScrapedCircular[]> {
    const items: RawScrapedCircular[] = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(this.sourceUrl, {
        headers: { 'User-Agent': 'RegIntel/1.0', 'Accept': 'application/rss+xml,application/xml,text/xml' },
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`CBDT RSS returned HTTP ${res.status}`);
      const xml = await res.text();
      const $ = cheerio.load(xml, { xmlMode: true });

      $('item').each((_, el) => {
        const title = cleanRowText($(el).find('title').first().text());
        const link = cleanRowText($(el).find('link').first().text());
        const description = cleanRowText($(el).find('description').first().text());
        const pubDate = cleanRowText($(el).find('pubDate').first().text());
        const sourceUrl = normalizeUrl('https://www.incometaxindia.gov.in', link);
        const publishDate = parseDate(pubDate);
        const rawText = [title, description, pubDate].filter(Boolean).join(' — ');
        if (!title || title.length < 15 || !sourceUrl || !publishDate) return;

        items.push({
          regulator: 'CBDT',
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
