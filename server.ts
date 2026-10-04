import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { summarizeRegulatoryNotification, askComplianceAssistant } from './server/gemini';
import { runScrapeAndSummarizePipeline, runScraperForRegulator } from './server/scrapers/orchestrator';
import { generateRssFeedXml } from './server/rss';
import { Regulator, NotificationItem } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'RegIntel Feed Backend',
      time: new Date().toISOString(),
      itemsCount: db.getNotifications().length,
    });
  });

  // 1. Notifications Feed Endpoint
  app.get('/api/notifications', (req, res) => {
    try {
      const { regulator, tag, search, urgency, startDate, endDate } = req.query;
      const notifications = db.getNotifications({
        regulator: regulator ? String(regulator) : undefined,
        tag: tag ? String(tag) : undefined,
        search: search ? String(search) : undefined,
        urgency: urgency ? String(urgency) : undefined,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
      });

      res.json({
        success: true,
        count: notifications.length,
        items: notifications,
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // 2. Single Notification Detail
  app.get('/api/notifications/:id', (req, res) => {
    try {
      const item = db.getNotificationById(req.params.id);
      if (!item) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }
      res.json({ success: true, item });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // 3. Saved / Bookmarked Items
  app.get('/api/saved', (req, res) => {
    try {
      const saved = db.getSavedItems();
      res.json({ success: true, items: saved });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  app.post('/api/notifications/save', (req, res) => {
    try {
      const { notificationId, note } = req.body;
      if (!notificationId) {
        return res.status(400).json({ success: false, error: 'notificationId is required' });
      }
      const result = db.toggleSaveItem(notificationId, note || '');
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  app.put('/api/saved/:id/note', (req, res) => {
    try {
      const { note } = req.body;
      const updated = db.updateSavedItemNote(req.params.id, note || '');
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Saved item not found' });
      }
      res.json({ success: true, item: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  app.delete('/api/saved/:id', (req, res) => {
    try {
      const deleted = db.deleteSavedItem(req.params.id);
      res.json({ success: true, deleted });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // 4. Daily Digest View
  app.get('/api/digest/today', (req, res) => {
    try {
      const prefs = db.getUserPreferences();
      const allItems = db.getNotifications();

      // Filter by selected regulators if configured
      const filtered = allItems.filter((item) =>
        prefs.selectedRegulators.includes(item.regulator)
      );

      const highUrgency = filtered.filter((i) => i.urgency === 'HIGH');
      const regulatorBreakdown: Record<Regulator, number> = {
        SEBI: 0,
        RBI: 0,
        MCA: 0,
        CBDT: 0,
        CBIC: 0,
      };
      filtered.forEach((i) => {
        regulatorBreakdown[i.regulator] = (regulatorBreakdown[i.regulator] || 0) + 1;
      });

      const topActions: string[] = [];
      filtered.forEach((item) => {
        if (item.keyActionItems) {
          item.keyActionItems.forEach((action) => {
            if (topActions.length < 6 && !topActions.includes(action)) {
              topActions.push(`[${item.regulator}] ${action}`);
            }
          });
        }
      });

      const executiveBrief =
        filtered.length > 0
          ? `Today's regulatory perimeter highlights ${filtered.length} active updates across ${Object.entries(regulatorBreakdown).filter(([, count]) => count > 0).map(([reg, c]) => `${c} ${reg}`).join(', ')}. Key focus areas include performance track-record verification for RIA/RAs, RBI digital payment cyber controls, and tightened TDS/GST disclosures.`
          : 'No urgent regulatory notifications recorded in today’s cycle. Routine compliance reporting schedules apply.';

      res.json({
        success: true,
        digest: {
          date: new Date().toISOString().split('T')[0],
          totalNotifications: filtered.length,
          highUrgencyCount: highUrgency.length,
          executiveBrief,
          topActionItems: topActions,
          regulatorBreakdown,
          items: filtered.slice(0, 15),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // 5. User Preferences / Digest Settings
  app.get('/api/settings', (req, res) => {
    try {
      const prefs = db.getUserPreferences();
      res.json({ success: true, preferences: prefs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      const updated = db.updateUserPreferences(req.body);
      res.json({ success: true, preferences: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // 6. Source Manager / Admin Endpoints
  app.get('/api/sources', (req, res) => {
    try {
      const sources = db.getScraperSources();
      res.json({ success: true, sources });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // Trigger manual scrape across all sources
  app.post('/api/sources/scrape-all', async (req, res) => {
    try {
      console.log('Initiating manual scrape pipeline across all regulators...');
      const report = await runScrapeAndSummarizePipeline();
      res.json({
        success: true,
        report,
        updatedNotificationsCount: db.getNotifications().length,
      });
    } catch (error: any) {
      console.error('Error executing scraper pipeline:', error);
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // Trigger manual scrape for a single source
  app.post('/api/sources/scrape-one', async (req, res) => {
    try {
      const { regulator } = req.body;
      if (!regulator) {
        return res.status(400).json({ success: false, error: 'regulator is required' });
      }
      const result = await runScraperForRegulator(regulator as Regulator);
      res.json({ success: true, result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // Test manual ingestion of a circular (URL or raw text) for immediate AI summarization
  app.post('/api/sources/manual-ingest', async (req, res) => {
    try {
      const { regulator, title, refNumber, rawText, sourceUrl } = req.body;
      if (!regulator || !title || !rawText) {
        return res.status(400).json({
          success: false,
          error: 'regulator, title, and rawText are required',
        });
      }

      const aiResult = await summarizeRegulatoryNotification({
        regulator,
        title,
        refNumber,
        rawText,
      });

      const newNotification: NotificationItem = {
        id: `${regulator.toLowerCase()}-manual-${Date.now()}`,
        regulator,
        title,
        refNumber: refNumber || `MANUAL/${Date.now().toString().slice(-4)}`,
        publishDate: new Date().toISOString().split('T')[0],
        sourceUrl: sourceUrl || 'https://regintel.ai.studio/manual-ingest',
        rawText,
        aiSummary: aiResult.summary,
        impactTags: aiResult.impactTags,
        applicableEntities: aiResult.applicableEntities,
        urgency: aiResult.urgency,
        keyActionItems: aiResult.keyActionItems,
        scrapedAt: new Date().toISOString(),
        isNew: true,
      };

      db.addNotification(newNotification);
      res.json({ success: true, item: newNotification });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // 7. Interactive AI Compliance Assistant (Ask questions about any specific circular)
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { circularTitle, regulator, refNumber, rawText, question } = req.body;
      if (!circularTitle || !question) {
        return res.status(400).json({
          success: false,
          error: 'circularTitle and question are required',
        });
      }

      const answer = await askComplianceAssistant({
        circularTitle,
        regulator: regulator || 'SEBI/RBI',
        refNumber,
        rawText: rawText || circularTitle,
        question,
      });

      res.json({ success: true, answer });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error?.message });
    }
  });

  // 8. Consolidated RSS Feed Endpoint (Requested by user)
  const rssHandler = (req: express.Request, res: express.Response) => {
    try {
      const { regulator, tag } = req.query;
      const items = db.getNotifications({
        regulator: regulator ? String(regulator) : undefined,
        tag: tag ? String(tag) : undefined,
      });

      const filterDesc = [
        regulator ? `Regulator: ${regulator}` : null,
        tag ? `Tag: ${tag}` : null,
      ]
        .filter(Boolean)
        .join(', ');

      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const xml = generateRssFeedXml(items, {
        appUrl,
        filterDescription: filterDesc || undefined,
      });

      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      res.send(xml);
    } catch (error: any) {
      console.error('Error generating RSS XML:', error);
      res.status(500).send('Error generating RSS feed');
    }
  };

  app.get('/api/rss', rssHandler);
  app.get('/api/feed.xml', rssHandler);
  app.get('/api/rss.xml', rssHandler);

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[RegIntel Feed Server] Live and listening on http://0.0.0.0:${PORT}`);
    });
  }

  return app;
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
  });
}
