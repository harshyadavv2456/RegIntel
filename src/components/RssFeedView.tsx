import React, { useState, useEffect } from 'react';
import {
  Rss,
  Copy,
  CheckCircle2,
  ExternalLink,
  Sliders,
  Code,
  Radio,
  Share2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { ALL_REGULATORS, ALL_IMPACT_TAGS, Regulator } from '../types';

export const RssFeedView: React.FC = () => {
  const [copiedMaster, setCopiedMaster] = useState(false);
  const [copiedCustom, setCopiedCustom] = useState(false);
  const [selectedRegulator, setSelectedRegulator] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [xmlPreview, setXmlPreview] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const masterRssUrl = `${origin}/api/rss`;

  const customRssUrl = `${origin}/api/rss${
    selectedRegulator !== 'ALL' || selectedTag !== 'ALL'
      ? `?${[
          selectedRegulator !== 'ALL' ? `regulator=${selectedRegulator}` : '',
          selectedTag !== 'ALL' ? `tag=${encodeURIComponent(selectedTag)}` : '',
        ]
          .filter(Boolean)
          .join('&')}`
      : ''
  }`;

  useEffect(() => {
    fetchXmlPreview();
  }, [selectedRegulator, selectedTag]);

  const fetchXmlPreview = async () => {
    setLoadingPreview(true);
    try {
      const url =
        selectedRegulator !== 'ALL' || selectedTag !== 'ALL'
          ? `/api/rss?${[
              selectedRegulator !== 'ALL' ? `regulator=${selectedRegulator}` : '',
              selectedTag !== 'ALL' ? `tag=${encodeURIComponent(selectedTag)}` : '',
            ]
              .filter(Boolean)
              .join('&')}`
          : '/api/rss';

      const res = await fetch(url);
      const text = await res.text();
      setXmlPreview(text.slice(0, 1400) + (text.length > 1400 ? '\n\n<!-- ... truncated for preview ... -->' : ''));
    } catch (e) {
      setXmlPreview('<!-- Error loading live RSS XML preview -->');
    } finally {
      setLoadingPreview(false);
    }
  };

  const copyUrl = (url: string, setFn: (val: boolean) => void) => {
    navigator.clipboard.writeText(url);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <div className="rounded-xl border border-orange-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
                <Rss className="h-4 w-4" />
              </span>
              <h2 className="font-sans text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Consolidated Regulatory RSS Feed
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-sans leading-relaxed">
              Real-time, standards-compliant RSS 2.0 XML feed consolidating circulars and Gemini AI briefs across SEBI, RBI, MCA, CBDT, and CBIC for direct ingestion into reader apps, internal intranets, and compliance bots.
            </p>
          </div>

          {/* Quick Copy Master */}
          <button
            id="copy-master-rss-btn"
            onClick={() => copyUrl(masterRssUrl, setCopiedMaster)}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-orange-700 transition-all shadow-xs shrink-0"
          >
            {copiedMaster ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Master URL Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Master RSS URL</span>
              </>
            )}
          </button>
        </div>

        {/* Master Endpoint Box */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-800">
          <span className="rounded bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 text-[10px] font-bold shrink-0 self-start sm:self-center">
            LIVE XML ENDPOINT
          </span>
          <span className="flex-1 truncate text-blue-700 font-semibold">{masterRssUrl}</span>
          <a
            href={masterRssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 shrink-0 text-[11px]"
          >
            <span>Open XML</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Custom Filtered RSS Builder */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sliders className="h-4 w-4 text-blue-600" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
            Custom Filtered Feed Generator
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
          <div>
            <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
              Filter by Regulator:
            </label>
            <select
              id="rss-regulator-select"
              value={selectedRegulator}
              onChange={(e) => setSelectedRegulator(e.target.value)}
              aria-label="Filter RSS by regulator"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono shadow-2xs"
            >
              <option value="ALL">All Regulators (SEBI, RBI, MCA, CBDT, CBIC)</option>
              {ALL_REGULATORS.map((r) => (
                <option key={r} value={r}>
                  {r} Only
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
              Filter by Impact Category:
            </label>
            <select
              id="rss-tag-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              aria-label="Filter RSS by impact category"
              className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-mono shadow-2xs"
            >
              <option value="ALL">All Categories</option>
              {ALL_IMPACT_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filtered URL Output */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-800">
          <span className="flex-1 truncate text-blue-700">{customRssUrl}</span>
          <button
            id="copy-custom-rss-btn"
            onClick={() => copyUrl(customRssUrl, setCopiedCustom)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shrink-0 shadow-2xs"
          >
            {copiedCustom ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCustom ? 'Copied' : 'Copy Feed Link'}</span>
          </button>
        </div>
      </div>

      {/* Integration Guide Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
            <Radio className="h-4 w-4 text-emerald-600" />
            <span>Feedly / Inoreader / NetNewsWire</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">
            Paste the RSS URL into your reader search bar to receive instant notification pushes whenever new circulars are scraped and summarized.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
            <Share2 className="h-4 w-4 text-sky-600" />
            <span>Slack & Microsoft Teams</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">
            Use Slack's built-in <code>/feed subscribe [URL]</code> command or Teams RSS Webhook to push new AI regulatory briefs to your compliance channel.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
            <BookOpen className="h-4 w-4 text-amber-600" />
            <span>Outlook / Apple Mail RSS</span>
          </div>
          <p className="text-slate-600 leading-relaxed font-sans">
            Add this feed to Outlook's "RSS Subscriptions" folder for synchronized desktop alerts with your morning email workflow.
          </p>
        </div>
      </div>

      {/* Live XML Inspector Preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-slate-800">
            <Code className="h-4 w-4 text-blue-600" />
            <span>Live RSS 2.0 XML Schema Inspector</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {loadingPreview ? 'Fetching XML...' : 'Valid RSS 2.0 / Atom Compliant'}
          </span>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-900 p-4 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto max-h-72">
          <pre>{xmlPreview}</pre>
        </div>
      </div>
    </div>
  );
};
