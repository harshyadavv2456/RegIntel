import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Sparkles,
  Share2,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Clock,
  Building2,
  FileText,
  ListTodo,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { getRegulatorStyle, getImpactTagStyle, getUrgencyBadge } from '../utils/theme';

interface NotificationCardProps {
  item: NotificationItem;
  isSaved: boolean;
  onToggleSave: (item: NotificationItem) => void;
  onOpenAiAssistant: (item: NotificationItem) => void;
  savedNote?: string;
  compact?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  isSaved,
  onToggleSave,
  onOpenAiAssistant,
  savedNote,
  compact = false,
}) => {
  const [expandedText, setExpandedText] = useState(false);
  const [expandedActions, setExpandedActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const regStyle = getRegulatorStyle(item.regulator);
  const urgencyStyle = getUrgencyBadge(item.urgency);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `[${item.regulator}] ${item.title}\nRef: ${item.refNumber || 'N/A'}\nDate: ${item.publishDate}\n\nAI Summary:\n${item.aiSummary}\n\nImpact Tags: ${item.impactTags.join(', ')}\nSource: ${item.sourceUrl}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(item.publishDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article
      id={`notification-card-${item.id}`}
      className={`group relative rounded-xl border transition-all duration-200 ${
        isSaved
          ? 'border-blue-300 bg-blue-50/20 shadow-sm'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Regulator Source Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-wider border ${regStyle.bg} ${regStyle.text} ${regStyle.border}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${regStyle.dot}`} />
            {item.regulator}
          </span>

          {/* Reference Code */}
          {item.refNumber && (
            <span
              className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[260px] sm:max-w-xs"
              title={item.refNumber}
            >
              {item.refNumber}
            </span>
          )}

          {/* Urgency Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.2 font-mono text-[10px] font-semibold tracking-wider uppercase ${urgencyStyle.bg}`}
          >
            {item.urgency === 'HIGH' && <AlertTriangle className="h-2.5 w-2.5 text-red-600" />}
            {urgencyStyle.label}
          </span>

          {item.isNew && (
            <span className="rounded bg-blue-50 px-1.5 py-0.2 font-mono text-[10px] font-bold text-blue-700 border border-blue-200">
              NEW
            </span>
          )}
        </div>

        {/* Publish Date & Source Link */}
        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug mb-2 font-sans">
        {item.title}
      </h3>

      {/* AI Summary Box */}
      <div className="mb-3 rounded-lg border border-slate-200/90 bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-800">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-blue-700 mb-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Executive Brief</span>
        </div>
        <p className="font-sans text-slate-700 text-xs sm:text-sm leading-relaxed">{item.aiSummary}</p>
      </div>

      {/* Impact Tags & Entities */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {item.impactTags.map((tag, idx) => {
          const tagStyle = getImpactTagStyle(tag);
          return (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-mono font-medium border ${tagStyle.bg} ${tagStyle.text} ${tagStyle.border}`}
            >
              <span className={`h-1 w-1 rounded-full ${tagStyle.dot}`} />
              {tag}
            </span>
          );
        })}

        {item.applicableEntities && item.applicableEntities.length > 0 && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono ml-auto">
            <Building2 className="h-3 w-3 text-slate-400" />
            <span className="truncate max-w-[200px] sm:max-w-xs">
              {item.applicableEntities.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Key Action Items (Collapsible) */}
      {item.keyActionItems && item.keyActionItems.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setExpandedActions(!expandedActions)}
            className="flex items-center gap-1.5 text-xs font-mono text-amber-800 hover:text-amber-900 transition-colors font-medium"
          >
            <ListTodo className="h-3.5 w-3.5" />
            <span>
              {expandedActions ? 'Hide' : 'View'} Key Compliance Action Items ({item.keyActionItems.length})
            </span>
            {expandedActions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {expandedActions && (
            <ul className="mt-2 space-y-1.5 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 font-sans">
              {item.keyActionItems.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Collapsible Original Text */}
      {item.rawText && (
        <div className="mb-3">
          <button
            onClick={() => setExpandedText(!expandedText)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-mono transition-colors"
          >
            <FileText className="h-3 w-3" />
            <span>{expandedText ? 'Collapse' : 'Expand'} Original Gazette / Circular Text</span>
            {expandedText ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {expandedText && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {item.rawText}
            </div>
          )}
        </div>
      )}

      {/* Saved Note Badge if exists */}
      {savedNote && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50/60 p-2.5 text-xs text-blue-900">
          <span className="font-mono text-[10px] uppercase font-bold text-blue-700 block mb-0.5">
            Personal Compliance Note:
          </span>
          <p className="font-sans italic">{savedNote}</p>
        </div>
      )}

      {/* Footer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            id={`bookmark-btn-${item.id}`}
            onClick={() => onToggleSave(item)}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all shadow-2xs ${
              isSaved
                ? 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save with personal note'}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-blue-600 text-blue-600' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Bookmark'}</span>
          </button>

          {/* Ask AI Assistant */}
          <button
            id={`ask-ai-btn-${item.id}`}
            onClick={() => onOpenAiAssistant(item)}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-2xs"
            title="Ask AI questions about this circular"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Ask AI</span>
          </button>

          {/* Copy Brief */}
          <button
            id={`copy-brief-btn-${item.id}`}
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
            title="Copy brief to clipboard"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Source Document Link */}
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          <span>Official Document</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
};
