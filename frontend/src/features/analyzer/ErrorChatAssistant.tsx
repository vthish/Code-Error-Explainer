import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, RefreshCw, Terminal, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { AIAnalysisResult } from '../../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ErrorChatAssistantProps {
  errorText: string;
  result: AIAnalysisResult;
  language?: string | null;
}

export const ErrorChatAssistant: React.FC<ErrorChatAssistantProps> = ({ errorText, result, language }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I have analyzed **${result.error_type}**. Ask me any follow-up questions — like how to write unit tests to prevent this, installation commands, or step-by-step guidance!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!customMessage) setInput('');
    setIsLoading(true);

    try {
      const context = {
        error_text: errorText,
        error_type: result.error_type,
        summary: result.summary,
        likely_cause: result.likely_cause,
        fixed_code: result.fixed_code,
        language: language || undefined,
      };

      const res = await api.chatWithError(context, newMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ Failed to get AI response: ${err?.message || 'Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: '🧪 Write Unit Tests', prompt: 'Write an automated unit test to prevent this error from recurring.' },
    { label: '💡 Explain Simply', prompt: 'Explain this error simply as if to a junior developer.' },
    { label: '💻 Terminal Commands', prompt: 'What terminal or package manager commands do I need to run to fix this?' },
    { label: '⚡ Edge Cases', prompt: 'What other edge cases or pitfalls might occur with this code?' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-4 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-indigo-600/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Chat with this Error</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                Interactive Assistant
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ask follow-up questions, request automated tests, or explore edge cases</p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm"
        >
          {isExpanded ? 'Collapse Chat' : 'Ask Follow-up Questions'}
        </button>
      </div>

      {/* Expandable Chat Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap gap-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center mr-1">
              <Sparkles className="w-3 h-3 text-emerald-500 mr-1" /> Quick Prompts:
            </span>
            {QUICK_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleSend(item.prompt)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pl-9">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span>AI is thinking & formulating answer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this error or solution..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
