import React, { useState } from 'react';
import { AnalysisInput, AnalysisRecordDTO } from '../types';
import { api } from '../services/api';
import { AnalyzerForm } from '../features/analyzer/AnalyzerForm';
import { AnalyzerResult } from '../features/analyzer/AnalyzerResult';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AlertCircle, Sparkles } from 'lucide-react';

export const AnalyzerPage: React.FC = () => {
  const [record, setRecord] = useState<AnalysisRecordDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = async (input: AnalysisInput) => {
    setIsLoading(true);
    setErrorMessage('');
    setRecord(null);

    try {
      const data = await api.analyzeError(input);
      setRecord(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to analyze error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Automated Debugger</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          Debug Stack Traces & Errors Instantly
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Paste any error log, compiler output, Docker failure, or database exception to receive plain-English explanations, likely root causes, and verified fixes.
        </p>
      </div>

      {/* Input Form */}
      <AnalyzerForm onSubmit={handleAnalyze} isLoading={isLoading} />

      {/* API Error State Banner */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
          <div>
            <h4 className="font-semibold text-sm">Analysis Request Failed</h4>
            <p className="text-xs text-rose-600 dark:text-rose-300/90 mt-0.5">{errorMessage}</p>
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
