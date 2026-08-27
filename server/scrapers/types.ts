import { Regulator } from '../../src/types';

export interface RawScrapedCircular {
  regulator: Regulator;
  title: string;
  refNumber: string;
  publishDate: string; // YYYY-MM-DD
  sourceUrl: string;
  rawText: string;
}

export interface ScraperResult {
  regulator: Regulator;
  sourceUrl: string;
  success: boolean;
  itemsFound: number;
  newItemsCount: number;
  message: string;
  items: RawScrapedCircular[];
  error?: string;
}

export interface RegulatorScraper {
  regulator: Regulator;
  name: string;
  sourceUrl: string;
  scrape(): Promise<RawScrapedCircular[]>;
}
