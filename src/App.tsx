import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { FeedDashboard } from './components/FeedDashboard';
import { DailyDigestView } from './components/DailyDigestView';
import { SavedItemsView } from './components/SavedItemsView';
import { RssFeedView } from './components/RssFeedView';
import { SourceManagerView } from './components/SourceManagerView';
import { DigestSettingsView } from './components/DigestSettingsView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SaveNoteModal } from './components/SaveNoteModal';
import {
  NotificationItem,
  SavedItem,
  DailyDigest,
  ScraperSource,
  UserPreferences,
  Regulator,
} from './types';
import { Shield, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [sources, setSources] = useState<ScraperSource[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    id: 'usr_compliance_lead',
    name: 'Harsh Yadav',
    email: 'harshyadavv2456@gmail.com',
    selectedRegulators: ['SEBI', 'RBI', 'MCA', 'CBDT', 'CBIC'],
    selectedTags: ['RA compliance', 'tax filing', 'AML/KYC', 'disclosure norms', 'audit requirements'],
    defaultFilterOnlySelected: false,
    themeMode: 'dark-terminal',
  });

  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingDigest, setLoadingDigest] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);

  // Modals state
  const [selectedForAi, setSelectedForAi] = useState<NotificationItem | null>(null);
  const [selectedForSaveModal, setSelectedForSaveModal] = useState<NotificationItem | null>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load all initial data
  const loadFeed = useCallback(async () => {
    try {
      setLoadingFeed(true);
      const res = await fetch(`/api/notifications?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.items) {
        setNotifications(data.items);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  const loadSaved = useCallback(async () => {
    try {
      const res = await fetch(`/api/saved?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.items) {
        setSavedItems(data.items);
      }
    } catch (e) {
      console.error('Failed to load saved items:', e);
    }
  }, []);

  const loadDigest = useCallback(async () => {
    try {
      setLoadingDigest(true);
      const res = await fetch(`/api/digest/today?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.digest) {
        setDigest(data.digest);
      }
    } catch (e) {
      console.error('Failed to load daily digest:', e);
    } finally {
      setLoadingDigest(false);
    }
  }, []);

  const loadSources = useCallback(async () => {
    try {
      const res = await fetch(`/api/sources?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.sources) {
        setSources(data.sources);
      }
    } catch (e) {
      console.error('Failed to load sources:', e);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const res = await fetch(`/api/settings?ts=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
  }, []);

  useEffect(() => {
    loadFeed();
    loadSaved();
    loadDigest();
    loadSources();
    loadPreferences();

    // Keep the open dashboard synchronized with the GitHub/Vercel feed.
    // The backend feed is refreshed hourly; polling every 5 minutes ensures
    // the UI reflects a newly deployed dataset without a manual page refresh.
    const refreshTimer = window.setInterval(() => {
      loadFeed();
      loadDigest();
      loadSources();
    }, 5 * 60 * 1000);

    return () => window.clearInterval(refreshTimer);
  }, [loadFeed, loadSaved, loadDigest, loadSources, loadPreferences]);

  // Derived saved maps
  const savedIds = React.useMemo(() => new Set(savedItems.map((s) => s.notificationId)), [savedItems]);
  const savedNotes = React.useMemo(() => {
    const map: Record<string, string> = {};
    savedItems.forEach((s) => {
      if (s.personalNote) map[s.notificationId] = s.personalNote;
    });
    return map;
  }, [savedItems]);

  // Bookmark / Save actions
  const handleToggleSave = (item: NotificationItem) => {
    if (savedIds.has(item.id)) {
      // Direct remove
      fetch('/api/notifications/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: item.id }),
      }).then(() => {
        loadSaved();
        showToast(`Removed "${item.title.slice(0, 30)}..." from saved items.`, 'info');
      });
    } else {
      // Open note modal to allow adding compliance follow-up note
      setSelectedForSaveModal(item);
    }
  };

  const handleConfirmSaveWithNote = async (note: string) => {
    if (!selectedForSaveModal) return;
    try {
      await fetch('/api/notifications/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: selectedForSaveModal.id,
          note,
        }),
      });
      await loadSaved();
      showToast('Circular saved to compliance reading list!', 'success');
    } finally {
      setSelectedForSaveModal(null);
    }
  };

  const handleRemoveSaved = async (notificationId: string) => {
    await fetch('/api/notifications/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });
    await loadSaved();
    showToast('Item removed from saved list.', 'info');
  };

  const handleUpdateNote = async (savedId: string, note: string) => {
    await fetch(`/api/saved/${savedId}/note`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    await loadSaved();
    showToast('Personal compliance note updated.', 'success');
  };

  // Scraper Actions
  const handleTriggerScrapeAll = async () => {
    setIsScraping(true);
    showToast('Connecting to regulator portals (SEBI, RBI, MCA, CBDT, CBIC)...', 'info');
    try {
      const res = await fetch('/api/sources/scrape-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(
          `Scrape complete! Found ${data.report?.totalItemsFound || 0} circulars (${data.report?.newItemsIngested || 0} new ingested).`,
          'success'
        );
        await Promise.all([loadFeed(), loadDigest(), loadSources()]);
      } else {
        showToast(`Scrape pipeline error: ${data.error}`, 'error');
      }
    } catch (e: any) {
      showToast(`Network error during scrape: ${e?.message}`, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  const handleTriggerScrapeOne = async (regulator: Regulator) => {
    try {
      const res = await fetch('/api/sources/scrape-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regulator }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${regulator} portal scanned: ${data.result?.message || 'Updated successfully'}`, 'success');
        await Promise.all([loadFeed(), loadDigest(), loadSources()]);
      } else {
        showToast(`Error scraping ${regulator}: ${data.error}`, 'error');
      }
    } catch (e: any) {
      showToast(`Error: ${e?.message}`, 'error');
    }
  };

  const handleSavePreferences = async (updated: Partial<UserPreferences>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    const data = await res.json();
    if (data.success && data.preferences) {
      setPreferences(data.preferences);
      await loadDigest();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-mono text-slate-900 shadow-xl animate-fade-in backdrop-blur-md">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          ) : (
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={savedItems.length}
        isScraping={isScraping}
        onTriggerScrape={handleTriggerScrapeAll}
      />

      {/* Main App Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6">
        {activeTab === 'feed' && (
          <FeedDashboard
            notifications={notifications}
            savedIds={savedIds}
            savedNotes={savedNotes}
            onToggleSave={handleToggleSave}
            onOpenAiAssistant={(item) => setSelectedForAi(item)}
            loading={loadingFeed}
            onRefresh={loadFeed}
          />
        )}

        {activeTab === 'digest' && (
          <DailyDigestView
            digest={digest}
            loading={loadingDigest}
            onOpenNotification={(item) => setSelectedForAi(item)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedItemsView
            savedItems={savedItems}
            onRemoveSave={handleRemoveSaved}
            onUpdateNote={handleUpdateNote}
            onOpenAiAssistant={(item) => setSelectedForAi(item)}
          />
        )}

        {activeTab === 'rss' && <RssFeedView />}

        {activeTab === 'sources' && (
          <SourceManagerView
            sources={sources}
            isScraping={isScraping}
            onTriggerScrapeAll={handleTriggerScrapeAll}
            onTriggerScrapeOne={handleTriggerScrapeOne}
            onManualIngestSuccess={(newItem) => {
              setNotifications((prev) => [newItem, ...prev]);
              loadDigest();
              loadSources();
              showToast('New circular ingested and summarized!', 'success');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <DigestSettingsView
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span>RegIntel Feed &bull; SEBI &bull; RBI &bull; MCA &bull; CBDT &bull; CBIC</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setActiveTab('rss')}
              className="text-orange-600 hover:text-orange-700 hover:underline font-semibold"
            >
              Consolidated RSS (/api/rss)
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setActiveTab('sources')}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              Scraper Operations
            </button>
          </div>
        </div>
      </footer>

      {/* AI Assistant Modal */}
      {selectedForAi && (
        <AiAssistantModal
          notification={selectedForAi}
          onClose={() => setSelectedForAi(null)}
        />
      )}

      {/* Save Note Modal */}
      {selectedForSaveModal && (
        <SaveNoteModal
          notification={selectedForSaveModal}
          initialNote={savedNotes[selectedForSaveModal.id] || ''}
          onSave={handleConfirmSaveWithNote}
          onClose={() => setSelectedForSaveModal(null)}
        />
      )}
    </div>
  );
}
