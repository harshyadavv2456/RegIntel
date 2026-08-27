import React, { useState } from 'react';
import { Bookmark, X, Save, Check } from 'lucide-react';
import { NotificationItem } from '../types';

interface SaveNoteModalProps {
  notification: NotificationItem | null;
  initialNote?: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export const SaveNoteModal: React.FC<SaveNoteModalProps> = ({
  notification,
  initialNote = '',
  onSave,
  onClose,
}) => {
  const [note, setNote] = useState(initialNote);

  if (!notification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Bookmark className="h-4 w-4 text-blue-600" />
            <span>Save to Compliance Reading List</span>
          </div>
          <button
            id="close-save-modal-btn"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <span className="font-mono text-[10px] uppercase text-blue-700 font-bold block mb-1">
              [{notification.regulator}] {notification.refNumber || 'Official Circular'}
            </span>
            <p className="font-medium text-slate-900 text-sm leading-snug">
              {notification.title}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1.5 font-mono text-[11px] uppercase">
              Personal Compliance Note / Internal Follow-up (Optional)
            </label>
            <textarea
              id="save-note-textarea"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Discuss at next audit committee meeting; Check impact on client onboarding workflow; Due by Friday."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              id="cancel-save-note-btn"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-save-note-btn"
              type="button"
              onClick={() => onSave(note)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Circular</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
