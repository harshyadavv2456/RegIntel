import React from 'react';
import {
  Layers,
  Sparkles,
  Bookmark,
  Rss,
  Server,
  Settings,
  Shield,
  Activity,
  RefreshCw,
} from 'lucide-react';

export type ActiveTab = 'feed' | 'digest' | 'saved' | 'rss' | 'sources' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedCount: number;
  isScraping: boolean;
  onTriggerScrape: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  isScraping,
  onTriggerScrape,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md text-slate-900 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-sm text-white">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-lg font-bold tracking-tight text-slate-900">
                RegIntel<span className="text-blue-600">.Feed</span>
              </span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-blue-700 border border-blue-200">
                India Compliance
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans hidden sm:block">
              SEBI • RBI • MCA • CBDT • CBIC Regulatory Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
          <button
            id="nav-feed-tab"
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Feed</span>
          </button>

          <button
            id="nav-digest-tab"
            onClick={() => setActiveTab('digest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'digest'
                ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Daily Digest</span>
          </button>

          <button
            id="nav-saved-tab"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Saved</span>
            {savedCount > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                  activeTab === 'saved'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                {savedCount}
              </span>
            )}
          </button>

          <button
            id="nav-rss-tab"
            onClick={() => setActiveTab('rss')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'rss'
                ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Rss className="h-3.5 w-3.5 text-orange-500" />
            <span>RSS Feed</span>
          </button>

          <button
            id="nav-sources-tab"
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'sources'
                ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Source Manager</span>
            <span className="md:hidden">Sources</span>
          </button>

          <button
            id="nav-settings-tab"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-white text-blue-700 font-semibold shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Digest Preferences & Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </nav>

        {/* Quick Actions (Scrape Trigger & Live Status) */}
        <div className="flex items-center gap-2">
          <button
            id="quick-scrape-btn"
            onClick={onTriggerScrape}
            disabled={isScraping}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-2xs disabled:opacity-60"
            title="Trigger scrape now across SEBI, RBI, MCA, CBDT, CBIC"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isScraping ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScraping ? 'Scraping...' : 'Sync Sources'}</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-mono text-emerald-700 border border-emerald-200">
            <Activity className="h-3 w-3 animate-pulse text-emerald-600" />
            <span>AI Summarizer Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
