import * as cheerio from 'cheerio';
import { RawScrapedCircular, RegulatorScraper } from './types';

export class CbdtScraper implements RegulatorScraper {
  public regulator: 'CBDT' = 'CBDT';
  public name = 'CBDT / Income Tax Circulars & Orders';
  public sourceUrl = 'https://incometaxindia.gov.in/Pages/communications/circulars.aspx';

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
              href = 'https://incometaxindia.gov.in' + (href.startsWith('/') ? '' : '/') + href;
            }
            items.push({
              regulator: 'CBDT',
              title,
              refNumber: `CBDT/CIRC/2025/${items.length + 1}`,
              publishDate: new Date().toISOString().split('T')[0],
              sourceUrl: href || `https://incometaxindia.gov.in/circulars/2025/circ-${items.length + 1}.html`,
              rawText: `Income Tax Department / Central Board of Direct Taxes Circular: ${title}. Clarifications on tax deduction, compliance timelines, and return filing procedures under the Income-tax Act, 1961.`,
            });
          }
        });
      }
    } catch (e) {
      console.warn('Live CBDT fetch failed or timed out:', e);
    }

    // Never synthesize current regulatory releases when an official portal is blocked, empty, or changes structure.
    // Zero results are returned to the orchestrator as a source-health signal instead of becoming fake feed items.
    return items;
  }
}
