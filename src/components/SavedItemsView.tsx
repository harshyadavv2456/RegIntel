import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Save,
} from 'lucide-react';
import { SavedItem, NotificationItem } from '../types';
import { getRegulatorStyle, getImpactTagStyle } from '../utils/theme';

interface SavedItemsViewProps {
  savedItems: SavedItem[];
  onRemoveSave: (notificationId: string) => void;
  onUpdateNote: (savedId: string, note: string) => void;
  onOpenAiAssistant: (item: NotificationItem) => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({
  savedItems,
  onRemoveSave,
  onUpdateNote,
  onOpenAiAssistant,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const startEdit = (item: SavedItem) => {
    setEditingId(item.id);
    setEditNoteText(item.personalNote || '');
  };

  const saveEdit = (savedId: string) => {
    onUpdateNote(savedId, editNoteText);
    setEditingId(null);
  };

  const handleExportCsv = () => {
    const headers = ['Regulator', 'Reference', 'Title', 'Publish Date', 'Personal Note', 'AI Summary', 'Source URL'];
    const rows = savedItems.map((s) => {
      const n = s.notification;
      return [
        `"${n?.regulator || ''}"`,
        `"${n?.refNumber || ''}"`,
        `"${(n?.title || '').replace(/"/g, '""')}"`,
        `"${n?.publishDate || ''}"`,
        `"${(s.personalNote || '').replace(/"/g, '""')}"`,
        `"${(n?.aiSummary || '').replace(/"/g, '""')}"`,
        `"${n?.sourceUrl || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RegIntel_Saved_Workpaper_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Bookmark className="h-4 w-4 fill-blue-600" />
            </div>
            <h2 className="font-sans text-base font-bold text-slate-900">
              Saved Compliance Workpaper ({savedItems.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bookmarked circulars and internal action notes saved for compliance reviews.
          </p>
        </div>

        {savedItems.length > 0 && (
          <button
            id="export-workpaper-csv-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>Export CSV Workpaper</span>
          </button>
        )}
      </div>

      {/* List */}
      {savedItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Bookmark className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-slate-800 text-sm">No saved circulars yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the "Bookmark" button on any notification card in the feed to save it with custom compliance follow-up notes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedItems.map((saved) => {
            const item = saved.notification;
            if (!item) return null;

            const regStyle = getRegulatorStyle(item.regulator);
            const isEditing = editingId === saved.id;

            return (
              <div
                key={saved.id}
                className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
              >
                {/* Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 font-mono text-xs font-bold uppercase border ${regStyle.bg} ${regStyle.text} ${regStyle.border}`}
                    >
                      {item.regulator}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {item.refNumber || 'Official Circular'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      Saved: {new Date(saved.savedAt).toLocaleDateString('en-IN')}
                    </span>
                    <button
                      onClick={() => onRemoveSave(item.id)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                  {item.title}
                </h4>

                {/* AI Brief */}
                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {item.aiSummary}
                </p>

                {/* Personal Compliance Note Section */}
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-blue-700">
                      Internal Compliance Note
                    </span>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(saved)}
                        className="flex items-center gap-1 text-[11px] font-mono text-blue-700 hover:text-blue-800"
                      >
                        <Edit3 className="h-3 w-3" />
                        <span>Edit Note</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(saved.id)}
                          className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-blue-700"
                        >
                          <Save className="h-3 w-3" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-800 italic">
                      {saved.personalNote || 'No notes added. Click edit to add compliance instructions.'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAiAssistant(item)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 shadow-2xs font-medium"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Ask AI</span>
                    </button>
                  </div>

                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>View Gazette</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
