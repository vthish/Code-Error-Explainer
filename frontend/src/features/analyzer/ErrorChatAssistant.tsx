import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare, ExternalLink, X, Minimize2, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isFloating, setIsFloating] = useState(false);
  const [isFloatingMinimized, setIsFloatingMinimized] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const floatingMessagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const floatingMessagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    // Scroll inline container
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });

    // Scroll floating pop-up container
    if (floatingMessagesContainerRef.current) {
      floatingMessagesContainerRef.current.scrollTo({
        top: floatingMessagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
    floatingMessagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    if (isExpanded || (isFloating && !isFloatingMinimized)) {
      scrollToBottom('smooth');
      const timer = setTimeout(() => scrollToBottom('smooth'), 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isExpanded, isFloating, isFloatingMinimized, isLoading]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!customMessage) setInput('');
    setIsLoading(true);

    // Immediate auto-scroll when user sends a message
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
          content: `⚠️ Failed to get AI response: ${err?.message || 'Please try again.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom('smooth'), 80);
    }
  };

  const QUICK_PROMPTS = [
    { label: '🧪 Write Unit Tests', prompt: 'Write an automated unit test to prevent this error from recurring.' },
    { label: '💡 Explain Simply', prompt: 'Explain this error simply as if to a junior developer.' },
    { label: '💻 Terminal Commands', prompt: 'What terminal or package manager commands do I need to run to fix this?' },
    { label: '⚡ Edge Cases', prompt: 'What other edge cases or pitfalls might occur with this code?' },
  ];

  return (
    <>
      {/* 1. Main Inline Chat Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all">
        {/* Header Bar */}
        <div className="px-3.5 py-3 sm:px-5 sm:py-4 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-indigo-600/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 transition-colors">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer flex-1 min-w-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1 sm:gap-1.5 flex-wrap">
                <span>Chat with this Error</span>
                <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                  AI Assistant
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate sm:whitespace-normal">
                Ask follow-up questions & request code fixes
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Pop-up Mode Button */}
            <button
              type="button"
              onClick={() => {
                setIsFloating(true);
                setIsFloatingMinimized(false);
              }}
              title="Pop up as floating chat window"
              className="text-xs font-semibold px-2 sm:px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-emerald-50 dark:hover:bg-slate-700 flex items-center gap-1 sm:gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Pop up</span>
            </button>

            {/* Expand / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 transition-colors"
            >
              <span>{isExpanded ? 'Collapse' : 'Ask'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expandable Chat Body */}
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
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5 sm:gap-2 pt-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask follow-up questions..."
                disabled={isLoading}
                className="flex-1 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 transition-all shadow-sm shadow-emerald-600/20 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 2. Floating Pop-up Chat Window (Fixed for Mobile Phone and Desktop) */}
      {isFloating && (
        <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:bottom-5 sm:right-5 z-50 flex flex-col items-end pointer-events-none">
          {!isFloatingMinimized ? (
            <div className="w-full sm:w-[460px] h-[520px] max-h-[82dvh] sm:max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all pointer-events-auto">
              {/* Pop-up Header */}
              <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                      <span>Error AI Assistant</span>
                      <span className="px-1.5 py-0.2 text-[9px] bg-white/25 rounded-full font-medium">Pop-up</span>
                    </h3>
                    <p className="text-[10px] text-white/80 truncate max-w-[180px] sm:max-w-[220px]">{result.error_type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFloatingMinimized(true)}
                    title="Minimize"
                    className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors"
                  >
                    <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFloating(false)}
                    title="Close Pop-up"
                    className="p-1.5 rounded-md hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Pop-up Quick Prompts */}
              <div className="p-2 sm:p-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 bg-slate-50/70 dark:bg-slate-950/40 max-h-20 overflow-y-auto">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(item.prompt)}
                    className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Pop-up Messages Body with Auto-Scroll */}
              <div
                ref={floatingMessagesContainerRef}
                className="flex-1 p-3 sm:p-3.5 space-y-3 overflow-y-auto scroll-smooth"
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans break-words">{msg.content}</div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 pl-7 sm:pl-8">
                    <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>AI is formulating answer...</span>
                  </div>
                )}
                <div ref={floatingMessagesEndRef} />
              </div>

              {/* Pop-up Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 sm:gap-2 pointer-events-auto"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask follow-up questions..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1 sm:gap-1.5 transition-all shadow-sm shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            /* Minimized Floating Pill */
            <button
              type="button"
              onClick={() => setIsFloatingMinimized(false)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-xl shadow-emerald-600/30 transition-all transform active:scale-95 sm:hover:scale-105 pointer-events-auto"
            >
              <Bot className="w-4 h-4" />
              <span>Resume Chat</span>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            </button>
          )}
        </div>
      )}

      {/* 3. Floating Quick-Launch Button (when popup is not open) */}
      {!isFloating && (
        <button
          type="button"
          onClick={() => {
            setIsFloating(true);
            setIsFloatingMinimized(false);
          }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-1.5 sm:gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition-all transform active:scale-95 sm:hover:scale-105 group border border-white/20"
        >
          <Bot className="w-4 h-4 transition-transform group-hover:rotate-12" />
          <span>Ask AI Chat</span>
          <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping"></span>
        </button>
      )}
    </>
  );
};


