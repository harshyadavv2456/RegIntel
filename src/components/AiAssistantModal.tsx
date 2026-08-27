import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, CheckCircle2, Copy, AlertCircle, FileText } from 'lucide-react';
import { NotificationItem } from '../types';
import { getRegulatorStyle } from '../utils/theme';

interface AiAssistantModalProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  notification,
  onClose,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!notification) return null;

  const regStyle = getRegulatorStyle(notification.regulator);

  const suggestedQuestions = [
    'What are the mandatory statutory compliance deadlines mentioned?',
    'What are the specific penalties or regulatory enforcement risks for non-compliance?',
    'Draft an internal compliance email brief for our executive committee.',
    'Does this circular apply to Registered Investment Advisers or fintech payment entities?',
  ];

  const handleAsk = async (promptText?: string) => {
    const q = promptText || question;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circularTitle: notification.title,
          regulator: notification.regulator,
          refNumber: notification.refNumber,
          rawText: notification.rawText || notification.aiSummary,
          question: q,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.answer,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error || 'Failed to process compliance query. Please try again.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Connection error: ${err?.message || 'Unable to connect to AI server.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] max-h-[780px] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-bold text-slate-900">
                  AI Compliance Assistant
                </span>
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border ${regStyle.bg} ${regStyle.text} ${regStyle.border}`}
                >
                  {notification.regulator}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md font-mono">
                {notification.refNumber || notification.title}
              </p>
            </div>
          </div>
          <button
            id="close-ai-assistant-btn"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Circular Context Banner */}
        <div className="border-b border-slate-100 bg-blue-50/40 px-4 py-2.5 sm:px-6 text-xs">
          <div className="flex items-start gap-2 text-slate-700">
            <FileText className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 leading-relaxed">
              <span className="font-semibold text-slate-900">Analyzing:</span> {notification.title}
            </p>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {/* Initial Greeting & Context */}
          {messages.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-white p-4 text-xs text-slate-700 space-y-2 shadow-xs">
                <div className="flex items-center gap-1.5 font-semibold text-blue-700 font-sans">
                  <Bot className="h-4 w-4" />
                  <span>RegIntel AI Ready</span>
                </div>
                <p className="leading-relaxed">
                  I have indexed the official text, reference clauses, and Gemini intelligence for{' '}
                  <strong className="text-slate-900">{notification.title}</strong>. Ask any specific question regarding statutory impact, deadlines, legal obligations, or audit checklists.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                  Suggested Compliance Prompts
                </span>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {suggestedQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleAsk(sq)}
                      className="text-left rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700 hover:border-blue-400 hover:bg-blue-50/30 hover:text-slate-900 transition-all group shadow-2xs"
                    >
                      <span className="text-blue-600 font-mono text-[10px] font-semibold block mb-1 group-hover:text-blue-700">
                        Prompt {i + 1}
                      </span>
                      {sq}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversation history */}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-500 font-mono">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <User className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 text-blue-600" />
                    <span>RegIntel Intelligence</span>
                  </>
                )}
                <span>• {msg.time}</span>
              </div>

              <div
                className={`group relative max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none font-sans'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopyText(msg.content, idx)}
                    className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                  >
                    {copiedIndex === idx ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 p-3 text-xs text-slate-600 max-w-sm shadow-xs">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
              <span>Analyzing circular provisions with Gemini...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-assistant-input"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about compliance timelines, penalties, applicability..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans shadow-2xs"
              disabled={loading}
            />
            <button
              id="ai-assistant-send-btn"
              type="submit"
              disabled={!question.trim() || loading}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
