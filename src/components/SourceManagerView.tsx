import React, { useState } from 'react';
import {
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Info,
  Terminal,
  Zap,
} from 'lucide-react';
import { ScraperSource, Regulator, ALL_REGULATORS, NotificationItem } from '../types';
import { getRegulatorStyle } from '../utils/theme';

interface SourceManagerViewProps {
  sources: ScraperSource[];
  isScraping: boolean;
  onTriggerScrapeAll: () => Promise<void>;
  onTriggerScrapeOne: (regulator: Regulator) => Promise<void>;
  onManualIngestSuccess: (item: NotificationItem) => void;
}

export const SourceManagerView: React.FC<SourceManagerViewProps> = ({
  sources,
  isScraping,
  onTriggerScrapeAll,
  onTriggerScrapeOne,
  onManualIngestSuccess,
}) => {
  const [activeScrapingReg, setActiveScrapingReg] = useState<string | null>(null);
  const [ingestRegulator, setIngestRegulator] = useState<Regulator>('SEBI');
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestRef, setIngestRef] = useState('');
  const [ingestUrl, setIngestUrl] = useState('');
  const [ingestRawText, setIngestRawText] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);

  const handleSingleScrape = async (reg: Regulator) => {
    setActiveScrapingReg(reg);
    try {
      await onTriggerScrapeOne(reg);
    } finally {
      setActiveScrapingReg(null);
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestTitle.trim() || !ingestRawText.trim()) return;

    setIngesting(true);
    setIngestMessage(null);

    try {
      const res = await fetch('/api/sources/manual-ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regulator: ingestRegulator,
          title: ingestTitle.trim(),
          refNumber: ingestRef.trim(),
          sourceUrl: ingestUrl.trim(),
          rawText: ingestRawText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.item) {
        setIngestMessage('Successfully analyzed and ingested circular with Gemini AI!');
        onManualIngestSuccess(data.item);
        // Reset form
        setIngestTitle('');
        setIngestRef('');
        setIngestUrl('');
        setIngestRawText('');
      } else {
        setIngestMessage(`Error: ${data.error || 'Failed to ingest'}`);
      }
    } catch (err: any) {
      setIngestMessage(`Ingestion failed: ${err?.message}`);
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Server className="h-4 w-4" />
            </div>
            <h2 className="font-sans text-base font-bold text-slate-900 tracking-tight">
              Regulator Source Manager & Scraper Health
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Real-time status monitoring of public circular listing pages for SEBI, RBI, MCA, CBDT, and CBIC.
          </p>
        </div>

        {/* Big Scrape All Button */}
        <button
          id="trigger-all-scrapers-btn"
          onClick={onTriggerScrapeAll}
          disabled={isScraping}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all shadow-xs disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
          <span>{isScraping ? 'Scraping All Sources...' : 'Run Scrape Now (All Portals)'}</span>
        </button>
      </div>

      {/* Sources Health Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700">
            Tracked Regulatory Source Endpoints ({sources.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {sources.map((source) => {
            const regStyle = getRegulatorStyle(source.regulator);
            const isSingleScraping = activeScrapingReg === source.regulator;

            return (
              <div
                key={source.id}
                className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-xs font-bold uppercase border ${regStyle.bg} ${regStyle.text} ${regStyle.border}`}
                    >
                      {source.regulator}
                    </span>
                    <h4 className="font-semibold text-slate-900 text-sm truncate">
                      {source.name}
                    </h4>
                  </div>

                  {/* URL */}
                  <div className="flex items-center gap-1 font-mono text-xs text-slate-500 truncate">
                    <span className="text-slate-400">URL:</span>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline truncate"
                    >
                      {source.url}
                    </a>
                    <ExternalLink className="h-3 w-3 shrink-0 text-slate-400" />
                  </div>

                  {/* Scrape log message */}
                  <p className="text-xs text-slate-600 font-sans">
                    {source.lastScrapeMessage || 'Scraper initialized.'}
                  </p>
                </div>

                {/* Status & Single Scrape Trigger */}
                <div className="flex flex-wrap items-center gap-4 shrink-0 font-mono text-xs">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5">
                    {source.lastScrapeStatus === 'running' ? (
                      <span className="flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>SCRAPING</span>
                      </span>
                    ) : source.lastScrapeStatus === 'success' ? (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>HEALTHY</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-semibold">
                        <AlertCircle className="h-3 w-3" />
                        <span>DEGRADED</span>
                      </span>
                    )}
                  </div>

                  {/* Last Scrape Time */}
                  <div className="text-slate-500 text-[11px]">
                    <span className="text-slate-400 block">Last Run:</span>
                    {source.lastScrapeTime
                      ? new Date(source.lastScrapeTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Never'}
                  </div>

                  {/* Trigger Single */}
                  <button
                    onClick={() => handleSingleScrape(source.regulator)}
                    disabled={isScraping || isSingleScraping}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 shadow-2xs"
                  >
                    {isSingleScraping ? 'Running...' : 'Run Scraper'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Ingestion & Sandbox Testing Tool */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Zap className="h-4 w-4 text-amber-600" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
            Manual Ingestion & AI Test Sandbox
          </h3>
        </div>
        <p className="text-xs text-slate-600 font-sans">
          Have an unindexed official circular or gazette notification? Paste it here to test real-time Gemini AI extraction, impact tagging, and instant addition to the feed.
        </p>

        {ingestMessage && (
          <div
            className={`rounded-lg p-3 text-xs font-mono ${
              ingestMessage.includes('Success')
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {ingestMessage}
          </div>
        )}

        <form onSubmit={handleManualIngest} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
                Regulator
              </label>
              <select
                id="manual-ingest-regulator-select"
                value={ingestRegulator}
                onChange={(e) => setIngestRegulator(e.target.value as Regulator)}
                aria-label="Select regulator for manual ingestion"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 shadow-2xs"
              >
                {ALL_REGULATORS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
                Reference Number (e.g. SEBI/CIR/2025/08)
              </label>
              <input
                id="manual-ingest-ref-input"
                type="text"
                value={ingestRef}
                onChange={(e) => setIngestRef(e.target.value)}
                placeholder="SEBI/HO/MIRSD/2025/12"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
                Official PDF/URL Link (Optional)
              </label>
              <input
                id="manual-ingest-url-input"
                type="url"
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                placeholder="https://www.sebi.gov.in/circulars/..."
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
              Official Notification Title *
            </label>
            <input
              id="manual-ingest-title-input"
              type="text"
              required
              value={ingestTitle}
              onChange={(e) => setIngestTitle(e.target.value)}
              placeholder="e.g. Mandatory Client Code Validation for Algorithmic Trading Systems"
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
              Raw Gazette Text / Circular Clauses *
            </label>
            <textarea
              id="manual-ingest-raw-text-textarea"
              rows={3}
              required
              value={ingestRawText}
              onChange={(e) => setIngestRawText(e.target.value)}
              placeholder="Paste raw notification paragraphs, compliance deadlines, penalty terms..."
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end">
            <button
              id="submit-manual-ingest-btn"
              type="submit"
              disabled={ingesting || !ingestTitle || !ingestRawText}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{ingesting ? 'Analyzing with Gemini...' : 'Analyze & Ingest with AI'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Production Architecture & Scheduled Cron Notice */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2 text-xs text-slate-700 font-mono">
        <div className="flex items-center gap-2 text-blue-700 font-bold">
          <Terminal className="h-4 w-4" />
          <span>Production Architecture & Scheduled Scraping Deployment Note</span>
        </div>
        <p className="font-sans leading-relaxed text-slate-700">
          The scraper engine is structured around modular extractors for SEBI, RBI, MCA, CBDT, and CBIC. In the Google AI Studio preview environment, automated scraping is triggered on-demand via the manual "Run Scrape Now" buttons.
        </p>
        <p className="font-sans leading-relaxed text-slate-600">
          When deployed to a persistent host (e.g., Google Cloud Run with Google Cloud Scheduler, AWS Lambda + EventBridge, or Kubernetes CronJobs), the backend function <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">runScrapeAndSummarizePipeline()</code> can be scheduled to run every 30–60 minutes automatically.
        </p>
      </div>
    </div>
  );
};
