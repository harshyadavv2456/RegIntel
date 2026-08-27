import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Layers,
  Sparkles,
  SlidersHorizontal,
  X,
  AlertCircle,
  Calendar,
  Tag,
  RotateCcw,
  Check,
  ChevronDown,
} from 'lucide-react';
import { NotificationItem, Regulator, ALL_REGULATORS, ALL_IMPACT_TAGS } from '../types';
import { NotificationCard } from './NotificationCard';
import { getRegulatorStyle } from '../utils/theme';

interface FeedDashboardProps {
  notifications: NotificationItem[];
  savedIds: Set<string>;
  savedNotes: Record<string, string>;
  onToggleSave: (item: NotificationItem) => void;
  onOpenAiAssistant: (item: NotificationItem) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const FeedDashboard: React.FC<FeedDashboardProps> = ({
  notifications,
  savedIds,
  savedNotes,
  onToggleSave,
  onOpenAiAssistant,
  loading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegulator, setSelectedRegulator] = useState<string>('ALL');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [compactMode, setCompactMode] = useState(false);

  // Count items per regulator
  const regulatorCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: notifications.length };
    ALL_REGULATORS.forEach((r) => {
      counts[r] = notifications.filter((n) => n.regulator === r).length;
    });
    return counts;
  }, [notifications]);

  // Filter logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // 1. Regulator
      if (selectedRegulator !== 'ALL' && item.regulator !== selectedRegulator) {
        return false;
      }

      // 2. Impact Tag
      if (selectedTag !== 'ALL') {
        const hasTag = item.impactTags.some(
          (t) => t.toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // 3. Urgency
      if (selectedUrgency !== 'ALL' && item.urgency !== selectedUrgency) {
        return false;
      }

      // 4. Date Range
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.publishDate).getTime();
        const now = Date.now();
        if (dateFilter === 'today') {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (itemDate < startOfToday) return false;
        } else if (dateFilter === '7d') {
          if (itemDate < now - 7 * 86400000) return false;
        } else if (dateFilter === '30d') {
          if (itemDate < now - 30 * 86400000) return false;
        }
      }

      // 5. Full text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSummary = item.aiSummary.toLowerCase().includes(q);
        const inRef = item.refNumber?.toLowerCase().includes(q);
        const inRaw = item.rawText?.toLowerCase().includes(q);
        const inTags = item.impactTags.some((t) => t.toLowerCase().includes(q));
        const inEntities = item.applicableEntities.some((e) => e.toLowerCase().includes(q));

        if (!inTitle && !inSummary && !inRef && !inRaw && !inTags && !inEntities) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, selectedRegulator, selectedTag, selectedUrgency, dateFilter, searchQuery]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedRegulator !== 'ALL' ||
    selectedTag !== 'ALL' ||
    selectedUrgency !== 'ALL' ||
    dateFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegulator('ALL');
    setSelectedTag('ALL');
    setSelectedUrgency('ALL');
    setDateFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Search & Control Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Top Search Line */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="feed-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars, reference numbers, guidelines, impact keywords..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans shadow-2xs"
            />
            {searchQuery && (
              <button
                id="clear-search-btn"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick preset chips or Compact Mode */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="compact-mode-toggle-btn"
              onClick={() => setCompactMode(!compactMode)}
              className={`rounded-lg border px-3 py-2 text-xs font-mono transition-colors shadow-2xs ${
                compactMode
                  ? 'border-blue-300 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {compactMode ? 'Density: Compact' : 'Density: Standard'}
            </button>

            {hasActiveFilters && (
              <button
                id="reset-filters-btn"
                onClick={handleResetFilters}
                className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs"
                title="Reset all filters"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Regulator Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-mono uppercase text-slate-500 font-semibold mr-1 shrink-0">
            Regulator:
          </span>
          <button
            id="regulator-filter-all"
            onClick={() => setSelectedRegulator('ALL')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-mono transition-all shrink-0 ${
              selectedRegulator === 'ALL'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>ALL</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedRegulator === 'ALL' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {regulatorCounts['ALL'] || 0}
            </span>
          </button>

          {ALL_REGULATORS.map((reg) => {
            const isSelected = selectedRegulator === reg;
            const style = getRegulatorStyle(reg);
            return (
              <button
                key={reg}
                id={`regulator-filter-${reg.toLowerCase()}`}
                onClick={() => setSelectedRegulator(reg)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono transition-all shrink-0 border ${
                  isSelected
                    ? `${style.bg} ${style.text} ${style.border} font-bold ring-1 ring-blue-500/40 shadow-2xs`
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                <span>{reg}</span>
                <span className="text-[10px] opacity-80">({regulatorCounts[reg] || 0})</span>
              </button>
            );
          })}
        </div>

        {/* Second Filter Bar: Impact Tags, Urgency, Date Range */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Impact Tag Selector */}
          <div className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-slate-400" />
            <select
              id="tag-filter-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              aria-label="Filter by impact category"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none font-mono shadow-2xs"
            >
              <option value="ALL">All Impact Categories</option>
              {ALL_IMPACT_TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Selector */}
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
            <select
              id="urgency-filter-select"
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              aria-label="Filter by urgency level"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none font-mono shadow-2xs"
            >
              <option value="ALL">All Urgencies</option>
              <option value="HIGH">High Impact Only</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Routine</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              {(['all', 'today', '7d', '30d'] as const).map((d) => (
                <button
                  key={d}
                  id={`date-filter-${d}`}
                  onClick={() => setDateFilter(d)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    dateFilter === d
                      ? 'bg-white text-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d === 'all' ? 'All Time' : d === 'today' ? 'Today' : d === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Result Count Indicator */}
          <div className="ml-auto text-slate-500 font-mono text-xs">
            Showing <strong className="text-blue-700">{filteredNotifications.length}</strong> of{' '}
            {notifications.length} circulars
          </div>
        </div>
      </div>

      {/* Feed Cards List */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-3" />
          <p className="font-mono text-sm text-slate-700">Synchronizing regulatory intelligence feed...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Filter className="h-5 w-5" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">No circulars match current filters</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, selecting different regulator pills, or resetting the date filter.
          </p>
          <button
            id="empty-reset-filters-btn"
            onClick={handleResetFilters}
            className="rounded-lg bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            Clear Active Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              isSaved={savedIds.has(item.id)}
              savedNote={savedNotes[item.id]}
              onToggleSave={onToggleSave}
              onOpenAiAssistant={onOpenAiAssistant}
              compact={compactMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
