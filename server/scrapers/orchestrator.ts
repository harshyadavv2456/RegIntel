import { db } from '../db';
import { summarizeRegulatoryNotification } from '../gemini';
import { Regulator, NotificationItem } from '../../src/types';
import { SebiScraper } from './sebi';
import { RbiScraper } from './rbi';
import { McaScraper } from './mca';
import { CbdtScraper } from './cbdt';
import { CbicScraper } from './cbic';
import { RegulatorScraper, ScraperResult } from './types';

// Registry of regulator scraper modules
const SCRAPERS: Record<Regulator, RegulatorScraper> = {
  SEBI: new SebiScraper(),
  RBI: new RbiScraper(),
  MCA: new McaScraper(),
  CBDT: new CbdtScraper(),
  CBIC: new CbicScraper(),
};

/**
 * PRODUCTION DEPLOYMENT NOTE:
 * The `runScrapeAndSummarizePipeline` function below is designed as a standalone,
 * idempotent pipeline. In a production environment with persistent cron capabilities
 * (e.g., Cloud Scheduler + Cloud Run, AWS EventBridge, or Kubernetes CronJob),
 * you can invoke this function periodically (e.g., `0 * * * *` for hourly scraping):
 *
 * Example (with node-cron or external webhook):
 * ```ts
 * import cron from 'node-cron';
 * cron.schedule('0 * * * *', async () => {
 *   console.log('Running automated hourly regulatory scrape...');
 *   await runScrapeAndSummarizePipeline();
 * });
 * ```
 */

export interface PipelineExecutionReport {
  timestamp: string;
  totalSourcesProcessed: number;
  totalItemsFound: number;
  newItemsIngested: number;
  results: ScraperResult[];
}

export async function runScraperForRegulator(regulator: Regulator): Promise<ScraperResult> {
  const scraper = SCRAPERS[regulator];
  if (!scraper) {
    throw new Error(`No scraper registered for regulator: ${regulator}`);
  }

  const sourceId = `src-${regulator.toLowerCase()}-${regulator === 'SEBI' || regulator === 'MCA' ? 'circulars' : regulator === 'RBI' ? 'notifications' : regulator === 'CBDT' ? 'tax' : 'gst'}`;

  // Update source status to running
  db.updateScraperSource(sourceId, {
    lastScrapeStatus: 'running',
    lastScrapeMessage: `Actively scraping ${regulator} portal...`,
  });

  try {
    const rawItems = await scraper.scrape();
    let newItemsCount = 0;

    for (const item of rawItems) {
      const existing = db.findBySourceUrlOrRef(item.sourceUrl, item.refNumber);
      if (!existing) {
        // Run Gemini AI summarization and impact tagging
        const aiResult = await summarizeRegulatoryNotification({
          regulator: item.regulator,
          title: item.title,
          refNumber: item.refNumber,
          rawText: item.rawText,
        });

        const newNotification: NotificationItem = {
          id: `${item.regulator.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          regulator: item.regulator,
          title: item.title,
          refNumber: item.refNumber,
          publishDate: item.publishDate,
          sourceUrl: item.sourceUrl,
          rawText: item.rawText,
          aiSummary: aiResult.summary,
          impactTags: aiResult.impactTags,
          applicableEntities: aiResult.applicableEntities,
          urgency: aiResult.urgency,
          keyActionItems: aiResult.keyActionItems,
          scrapedAt: new Date().toISOString(),
          isNew: true,
        };

        db.addNotification(newNotification);
        newItemsCount++;
      }
    }

    const message = `Extracted ${rawItems.length} items; ${newItemsCount} new circular(s) ingested & summarized with Gemini.`;

    db.updateScraperSource(sourceId, {
      lastScrapeTime: new Date().toISOString(),
      lastScrapeStatus: 'success',
      lastScrapeMessage: message,
      totalItemsScraped: rawItems.length,
    });

    return {
      regulator,
      sourceUrl: scraper.sourceUrl,
      success: true,
      itemsFound: rawItems.length,
      newItemsCount,
      message,
      items: rawItems,
    };
  } catch (error: any) {
    const errorMsg = `Scrape failed: ${error?.message || 'Network/Parse error'}`;
    db.updateScraperSource(sourceId, {
      lastScrapeTime: new Date().toISOString(),
      lastScrapeStatus: 'failed',
      lastScrapeMessage: errorMsg,
    });

    return {
      regulator,
      sourceUrl: scraper.sourceUrl,
      success: false,
      itemsFound: 0,
      newItemsCount: 0,
      message: errorMsg,
      items: [],
      error: error?.message,
    };
  }
}

/**
 * Main scrape-and-summarize orchestrator across all regulator portals
 */
export async function runScrapeAndSummarizePipeline(): Promise<PipelineExecutionReport> {
  const regulators: Regulator[] = ['SEBI', 'RBI', 'MCA', 'CBDT', 'CBIC'];
  const results: ScraperResult[] = [];
  let totalItemsFound = 0;
  let newItemsIngested = 0;

  for (const reg of regulators) {
    try {
      const res = await runScraperForRegulator(reg);
      results.push(res);
      totalItemsFound += res.itemsFound;
      newItemsIngested += res.newItemsCount;
    } catch (e: any) {
      console.error(`Error scraping ${reg}:`, e);
      results.push({
        regulator: reg,
        sourceUrl: SCRAPERS[reg]?.sourceUrl || '',
        success: false,
        itemsFound: 0,
        newItemsCount: 0,
        message: e?.message || 'Fatal scraper error',
        items: [],
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalSourcesProcessed: regulators.length,
    totalItemsFound,
    newItemsIngested,
    results,
  };
}
