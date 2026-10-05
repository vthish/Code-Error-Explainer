import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnalysisInput, AnalysisRecordDTO } from '../types';
import { api } from '../services/api';
import { AnalyzerForm } from '../features/analyzer/AnalyzerForm';
import { AnalyzerResult } from '../features/analyzer/AnalyzerResult';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

function getFriendlyErrorMessage(raw: string): string {
  if (!raw) return 'Failed to analyze error. Please try again.';
  if (raw.includes('429') || raw.includes('quota') || raw.includes('RESOURCE_EXHAUSTED')) {
    return 'The AI service daily request quota was temporarily reached. Please retry in a moment, or ensure GEMINI_MODEL is set to gemini-3.5-flash.';
  }
  if (raw.includes('503') || raw.includes('UNAVAILABLE') || raw.includes('high demand')) {
    return 'The AI model is currently experiencing high demand. Please try again in a few seconds.';
  }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error?.message) {
        return parsed.error.message;
      }
    }
  } catch {
    // fallback to clean string
  }
  return raw;
}

export const AnalyzerPage: React.FC = () => {
  const [record, setRecord] = useState<AnalysisRecordDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastInput, setLastInput] = useState<AnalysisInput | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const location = useLocation();

  // Clear analysis and abort any in-flight request on unmount or navigation
  React.useEffect(() => {
    const handleClear = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsLoading(false);
      setRecord(null);
      setErrorMessage('');
    };

    window.addEventListener('clear-analyzer', handleClear);

    return () => {
      window.removeEventListener('clear-analyzer', handleClear);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // When navigating back to analyzer, ensure clean initial state
  React.useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [location.pathname]);

  const handleAnalyze = async (input: AnalysisInput) => {
    // Abort previous pending analysis if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage('');
    setRecord(null);
    setLastInput(input);

    try {
      const data = await api.analyzeError(input, controller.signal);
      setRecord(data);
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        // Navigation occurred or user canceled analysis
        return;
      }
      setErrorMessage(err instanceof Error ? err.message : 'Failed to analyze error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-10 px-3 sm:px-6">
      {/* Header */}
      <div className="text-center mb-5 sm:mb-8 pt-1">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] sm:text-xs font-semibold mb-2 sm:mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Automated Debugger</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Debug Stack Traces & Errors Instantly
        </h1>
        <p className="mt-2 text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-1 leading-relaxed">
          Paste any error log, compiler output, Docker failure, or database exception to receive plain-English explanations, likely root causes, and verified fixes.
        </p>
      </div>

      {/* Input Form */}
      <AnalyzerForm onSubmit={handleAnalyze} isLoading={isLoading} />

      {/* API Error State Banner */}
      {errorMessage && (
        <div className="mb-6 sm:mb-8 p-3.5 sm:p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 sm:gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h4 className="font-semibold text-xs sm:text-sm">Analysis Request Notice</h4>
              {lastInput && (
                <button
                  type="button"
                  onClick={() => handleAnalyze(lastInput)}
                  className="text-[11px] sm:text-xs font-medium text-rose-700 dark:text-rose-300 hover:underline flex items-center gap-1 bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              )}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-300/90 mt-1 break-words leading-relaxed font-sans">
              {getFriendlyErrorMessage(errorMessage)}
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton />}

      {/* Results View */}
      {record && <AnalyzerResult record={record} />}
    </div>
  );
};
