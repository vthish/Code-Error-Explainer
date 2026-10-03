import React from 'react';
import { AnalysisRecordDTO } from '../../types';
import { Trash2, ExternalLink, Calendar, Code2, AlertTriangle, RefreshCw } from 'lucide-react';

interface HistoryItemCardProps {
  record: AnalysisRecordDTO;
  onView: (record: AnalysisRecordDTO) => void;
  onDelete: (id: string) => void;
  onReanalyze?: (record: AnalysisRecordDTO) => void;
}

export const HistoryItemCard: React.FC<HistoryItemCardProps> = ({ record, onView, onDelete, onReanalyze }) => {
  const { result } = record;

  const severityColor = {
    low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    critical: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/50',
  }[result.severity] || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  const formattedDate = new Date(record.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white dark:bg-slate-900/70 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-xl p-5 transition-all shadow-md group flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${severityColor}`}>
              {result.severity.toUpperCase()}
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              {result.error_type}
            </span>
          </div>

          {record.language && (
            <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 rounded border border-slate-200 dark:border-slate-700/50 flex items-center gap-1">
              <Code2 className="w-3 h-3" /> {record.language}
            </span>
          )}
        </div>

        {/* Error Text Snippet */}
        <p className="text-xs font-mono text-rose-700 dark:text-rose-300/90 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-md border border-slate-200 dark:border-slate-800/80 truncate mb-3">
          {record.error_text}
        </p>

        {/* Summary */}
        <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-4">{result.summary}</p>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1 text-[11px]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          {onReanalyze && (
            <button
              onClick={() => onReanalyze(record)}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Re-analyze error"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onDelete(record.id)}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Delete analysis record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onView(record)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1 transition-colors"
          >
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
