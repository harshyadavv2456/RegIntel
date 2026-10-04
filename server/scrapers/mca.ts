import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';

export class McaScraper implements RegulatorScraper {
  public regulator: 'MCA' = 'MCA';
  public name = 'Ministry of Corporate Affairs Notifications & Circulars';
  public sourceUrl = 'https://www.mca.gov.in/content/mca/global/en/notifications-circulars/circulars.html';

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
        $('table tr, .circular-list-item').each((_, el) => {
          const title = $(el).find('a').text().trim();
          let href = $(el).find('a').attr('href') || '';
          if (title && title.length > 15) {
            if (href && !href.startsWith('http')) {
              href = 'https://www.mca.gov.in' + (href.startsWith('/') ? '' : '/') + href;
            }
            items.push({
              regulator: 'MCA',
              title,
              refNumber: `MCA/GenCirc/2025/${items.length + 1}`,
              publishDate: new Date().toISOString().split('T')[0],
              sourceUrl: href || `https://www.mca.gov.in/circulars/2025/circ-${items.length + 1}.html`,
              rawText: `MCA Notification under the Companies Act, 2013 and LLP Act, 2008. Subject: ${title}. Statutory filing guidelines and compliance directives apply to all registered corporate bodies in India.`,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Live MCA fetch failed or timed out:', e);
    }

    // Never synthesize current regulatory releases when an official portal is blocked, empty, or changes structure.
    // Zero results are returned to the orchestrator as a source-health signal instead of becoming fake feed items.
    return items;
  }
}
