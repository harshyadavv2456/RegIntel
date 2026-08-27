import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Save,
  CheckCircle2,
  Tag,
  Check,
  User,
  Mail,
} from 'lucide-react';
import { UserPreferences, Regulator, ALL_REGULATORS, ALL_IMPACT_TAGS } from '../types';
import { getRegulatorStyle, getImpactTagStyle } from '../utils/theme';

interface DigestSettingsViewProps {
  preferences: UserPreferences;
  onSavePreferences: (updated: Partial<UserPreferences>) => Promise<void>;
}

export const DigestSettingsView: React.FC<DigestSettingsViewProps> = ({
  preferences,
  onSavePreferences,
}) => {
  const [name, setName] = useState(preferences.name || '');
  const [email, setEmail] = useState(preferences.email || '');
  const [selectedRegulators, setSelectedRegulators] = useState<Regulator[]>(
    preferences.selectedRegulators || ALL_REGULATORS
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    preferences.selectedTags || ALL_IMPACT_TAGS
  );
  const [defaultFilterOnlySelected, setDefaultFilterOnlySelected] = useState(
    preferences.defaultFilterOnlySelected || false
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleRegulator = (reg: Regulator) => {
    setSelectedRegulators((prev) =>
      prev.includes(reg) ? prev.filter((r) => r !== reg) : [...prev, reg]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const selectAllRegulators = () => setSelectedRegulators([...ALL_REGULATORS]);
  const deselectAllRegulators = () => setSelectedRegulators([]);

  const selectAllTags = () => setSelectedTags([...ALL_IMPACT_TAGS]);
  const deselectAllTags = () => setSelectedTags([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSavePreferences({
        name,
        email,
        selectedRegulators,
        selectedTags,
        defaultFilterOnlySelected,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
            <Settings className="h-4 w-4" />
          </div>
          <h2 className="font-sans text-base font-bold text-slate-900 tracking-tight">
            Compliance Digest & Profile Settings
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Personalize which regulatory bodies and legal impact tags are prioritized in your morning briefings and feed view.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Identity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
            Compliance Officer Profile
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
            <div>
              <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
                Full Name / Designation
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  id="settings-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Harsh Yadav (Head of Compliance)"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-mono text-[11px] mb-1 font-medium">
                Notification & Workpaper Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  id="settings-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="compliance@firm.in"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Selected Regulators */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
              Tracked Regulators
            </h3>
            <div className="flex gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={selectAllRegulators}
                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={deselectAllRegulators}
                className="text-slate-500 hover:text-slate-800 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {ALL_REGULATORS.map((reg) => {
              const selected = selectedRegulators.includes(reg);
              const style = getRegulatorStyle(reg);

              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => toggleRegulator(reg)}
                  className={`flex items-center justify-between rounded-lg border p-3 text-xs transition-all ${
                    selected
                      ? `${style.bg} ${style.border} ring-1 ring-blue-500/30 shadow-2xs`
                      : 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono font-bold">
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    <span className={selected ? style.text : 'text-slate-600'}>{reg}</span>
                  </div>
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Impact Tags */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-800">
              Impact Category Preferences
            </h3>
            <div className="flex gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={selectAllTags}
                className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={deselectAllTags}
                className="text-slate-500 hover:text-slate-800 hover:underline"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALL_IMPACT_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag);
              const style = getImpactTagStyle(tag);

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition-all ${
                    selected
                      ? `${style.bg} ${style.border} ring-1 ring-blue-500/20 shadow-2xs`
                      : 'border-slate-200 bg-slate-50 opacity-60 hover:opacity-100'
                  }`}
                >
                  <span className={`font-mono text-[11px] ${selected ? style.text : 'text-slate-600'}`}>
                    {tag}
                  </span>
                  <div
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                      selected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selected && <Check className="h-2.5 w-2.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Filter Mode Toggle */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              id="filter-only-selected-toggle"
              type="checkbox"
              checked={defaultFilterOnlySelected}
              onChange={(e) => setDefaultFilterOnlySelected(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="font-mono text-xs font-bold text-slate-800 block">
                Restrict Default Feed View to Selected Regulators Only
              </span>
              <span className="text-xs text-slate-500">
                When enabled, opening the Feed will automatically filter out regulators you haven't checked above.
              </span>
            </div>
          </label>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Preferences Saved Successfully!</span>
            </div>
          )}
          <button
            id="save-preferences-btn"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all shadow-xs disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
