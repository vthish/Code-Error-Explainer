import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../services/api';
import { AIAnalysisResult } from '../../types';
import { Bot, Send, User, ChevronDown, ChevronUp, Sparkles, X, Minimize2, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ErrorChatAssistantProps {
  errorText: string;
  result: AIAnalysisResult;
  language?: string;
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
  const [isFloating, setIsFloating] = useState(false);
  const [isFloatingMinimized, setIsFloatingMinimized] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const floatingMessagesContainerRef = useRef<HTMLDivElement>(null);

  // Smooth internal container scroll (never scrolls the window or body)
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    if (floatingMessagesContainerRef.current) {
      floatingMessagesContainerRef.current.scrollTo({
        top: floatingMessagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  // Lock body scroll only when modal is actively open on mobile
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isFloating && !isFloatingMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFloating, isFloatingMinimized]);

  useEffect(() => {
    if (isExpanded || (isFloating && !isFloatingMinimized)) {
      setTimeout(() => scrollToBottom('auto'), 60);
    }
  }, [messages, isExpanded, isFloating, isFloatingMinimized]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!customMessage) setInput('');
    setIsLoading(true);
    setTimeout(() => scrollToBottom('smooth'), 50);

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
          content: `⚠️ Failed to get AI response: ${err?.message || 'Please try again in a few moments.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom('smooth'), 80);
    }
  };

  const handleToggleCardChat = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // On mobile: toggle pop-up modal
      if (isFloating && !isFloatingMinimized) {
        setIsFloating(false);
      } else {
        setIsFloating(true);
        setIsFloatingMinimized(false);
      }
    } else {
      // On desktop: toggle inline expansion
      setIsExpanded(!isExpanded);
    }
  };

  const handleCloseModal = () => {
    setIsFloating(false);
    setIsFloatingMinimized(false);
  };

  const QUICK_PROMPTS = [
    { label: '🧪 Write Unit Tests', prompt: 'Write an automated unit test to prevent this error from recurring.' },
    { label: '💡 Explain Simply', prompt: 'Explain this error simply as if to a junior developer.' },
    { label: '💻 Terminal Commands', prompt: 'What terminal or package manager commands do I need to run to fix this?' },
    { label: '⚡ Edge Cases', prompt: 'What other edge cases or pitfalls might occur with this code?' },
  ];

  return (
    <>
      {/* 1. Main Inline Chat Card on the Page */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all">
        {/* Card Header Bar */}
        <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-indigo-600/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 transition-colors">
          <div
            onClick={handleToggleCardChat}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer flex-1 min-w-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span className="truncate">Chat with this Error</span>
                <span className="hidden sm:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full shrink-0">
                  AI Assistant
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Ask follow-up questions & get code fixes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Pop-up Mode Button (Desktop) */}
            <button
              type="button"
              onClick={() => {
                setIsFloating(true);
                setIsFloatingMinimized(false);
              }}
              title="Open as floating window"
              className="hidden sm:flex text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-700 items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px]">Pop-up</span>
            </button>

            {/* Chat Action Button */}
            <button
              type="button"
              onClick={handleToggleCardChat}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 transition-colors shrink-0"
            >
              <span>{isExpanded || (isFloating && !isFloatingMinimized) ? 'Collapse' : 'Chat'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Desktop Inline Chat Stream */}
        {isExpanded && (
          <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
            {/* Quick Preset Prompts */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800 max-h-24 overflow-y-auto">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 flex items-center mr-1">
                <Sparkles className="w-3 h-3 text-emerald-500 mr-1 shrink-0" /> Quick Prompts:
              </span>
              {QUICK_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSend(item.prompt)}
                  className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Messages Stream */}
            <div
              ref={messagesContainerRef}
              className="space-y-3 max-h-72 sm:max-h-80 overflow-y-auto pr-1 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 sm:gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans break-words">{msg.content}</div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pl-7 sm:pl-9">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>AI is thinking & formulating answer...</span>
                </div>
              )}
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
                placeholder="Ask follow-up questions..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 sm:py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/25 shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 2. Pop-up Chat Modal Window (Rendered directly in body via Portal to avoid parent overflow clipping) */}
      {typeof document !== 'undefined' &&
        isFloating &&
        !isFloatingMinimized &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-end sm:items-end pointer-events-auto sm:p-5">
            {/* Backdrop: Clicking outside sheet collapses/closes it */}
            <div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
              onClick={handleCloseModal}
            />

            {/* Modal Container: Modern slide-up bottom sheet on mobile (rounded-t-[32px]), floating card on desktop */}
            <div className="relative z-10 w-full sm:w-[480px] h-[92dvh] sm:h-[580px] max-h-[92dvh] sm:max-h-[85vh] flex flex-col bg-slate-950 sm:bg-slate-900 border-t sm:border border-slate-700/80 sm:border-slate-800 rounded-t-[32px] sm:rounded-3xl shadow-[0_-12px_40px_rgba(0,0,0,0.7)] sm:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300 ease-out">
              {/* Header Bar */}
              <div className="shrink-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex flex-col shadow-md">
                {/* Mobile Drag Indicator Handle */}
                <div
                  onClick={handleCloseModal}
                  className="w-full sm:hidden pt-2.5 pb-1 flex justify-center cursor-pointer active:opacity-70 transition-opacity"
                >
                  <div className="w-12 h-1.5 bg-white/40 rounded-full" />
                </div>

                <div className="h-14 px-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/25">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold flex items-center gap-1.5 leading-tight">
                        <span>AI Error Assistant</span>
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-400/30 text-emerald-100 rounded-full font-semibold border border-white/20 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          Live
                        </span>
                      </h3>
                      <p className="text-[11px] text-white/80 truncate max-w-[200px] sm:max-w-[260px] font-mono mt-0.5">
                        {result.error_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsFloatingMinimized(true)}
                      title="Minimize"
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all border border-white/15"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      title="Close"
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all border border-white/15"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Prompts: Horizontal swipeable chips */}
              <div className="shrink-0 px-3.5 py-2.5 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1 mr-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Prompts:
                </span>
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(item.prompt)}
                    className="text-xs whitespace-nowrap px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-600/20 active:scale-95 text-slate-200 hover:text-emerald-300 border border-slate-700/80 hover:border-emerald-500/40 transition-all shadow-xs shrink-0"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Messages Body */}
              <div
                ref={floatingMessagesContainerRef}
                className="flex-1 min-h-0 p-4 space-y-3.5 overflow-y-auto overscroll-contain bg-slate-950/40"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/20">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-tr-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md shadow-emerald-600/20'
                          : 'rounded-tl-sm bg-slate-900 border border-slate-800/90 text-slate-100 shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans break-words">{msg.content}</div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2.5 text-xs text-slate-400 pl-9 py-1">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium animate-pulse">Formulating AI explanation & code...</span>
                  </div>
                )}
              </div>

              {/* Bottom Input Bar: Big, spacious, comfortable typing field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="shrink-0 p-3.5 sm:p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-800/90 bg-slate-950 flex items-center gap-2.5 shadow-2xl"
              >
                <input
                  type="text"
                  value={input}
                  onFocus={() => {
                    setTimeout(() => scrollToBottom('smooth'), 150);
                  }}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask follow-up questions..."
                  disabled={isLoading}
                  className="flex-1 py-3 sm:py-3.5 px-4 sm:px-5 rounded-2xl bg-slate-900 border-2 border-slate-700/80 text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="h-11 sm:h-12 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 active:scale-95 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* 3. Minimized Floating Button */}
      {typeof document !== 'undefined' &&
        isFloating &&
        isFloatingMinimized &&
        createPortal(
          <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] pointer-events-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => setIsFloatingMinimized(false)}
              className="flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-2xl shadow-emerald-600/40 transition-all transform active:scale-95 hover:scale-105 border border-emerald-400/30"
            >
              <Bot className="w-4 h-4 text-emerald-100" />
              <span>Resume Chat</span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </button>
          </div>,
          document.body
        )}

      {/* 4. Floating Quick-Launch Button (when popup was never opened) */}
      {!isFloating && (
        <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 pointer-events-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              setIsFloating(true);
              setIsFloatingMinimized(false);
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-xl shadow-emerald-600/35 transition-all transform active:scale-95 sm:hover:scale-105 group border border-emerald-400/30"
          >
            <Bot className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>Ask AI Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping"></span>
          </button>
        </div>
      )}
    </>
  );
};
