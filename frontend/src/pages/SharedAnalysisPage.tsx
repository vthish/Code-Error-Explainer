import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnalysisRecordDTO } from '../types';
import { api } from '../services/api';
import { AnalyzerResult } from '../features/analyzer/AnalyzerResult';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Sparkles, ArrowLeft, AlertCircle, Share2 } from 'lucide-react';

export const SharedAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<AnalysisRecordDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedAnalysis = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getPublicAnalysis(id);
        setRecord(data);
      } catch (err: any) {
        setError(err?.message || 'Shared analysis not found or has been removed.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedAnalysis();
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4">
      {/* Top Navigation & Branding Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>Shared AI Diagnosis</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                Public Link
              </span>
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              This error analysis was generated and shared via Code Error Explainer.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze Your Own Error</span>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Analysis Not Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Analyzer</span>
          </Link>
        </div>
      )}

      {/* Loaded Analysis */}
      {record && <AnalyzerResult record={record} />}
    </div>
  );
};
