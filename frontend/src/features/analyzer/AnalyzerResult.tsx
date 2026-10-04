import React from 'react';
import { AnalysisRecordDTO } from '../../types';
import { CodeBlock } from '../../components/common/CodeBlock';
import { AlertTriangle, CheckCircle2, HelpCircle, ArrowRight, ShieldCheck, ListChecks, FileText } from 'lucide-react';

interface AnalyzerResultProps {
  record: AnalysisRecordDTO;
}

export const AnalyzerResult: React.FC<AnalyzerResultProps> = ({ record }) => {
  const { result } = record;

  const severityColor = {
    low: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30',
    critical: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/50',
  }[result.severity] || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  const confidenceBadge = {
    low: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400',
    medium: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    high: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  }[result.confidence] || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400';

  return (
    <div className="space-y-6">
      {/* Top Meta Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shadow-md transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{result.error_type}</h2>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${severityColor}`}>
                {result.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Analysis Record ID: {record.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Confidence:</span>
          <span className={`px-2 py-0.5 rounded font-medium ${confidenceBadge}`}>
            {result.confidence.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Summary & Root Cause Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plain-English Summary */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm transition-colors">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Summary
          </h3>
          <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{result.summary}</p>
        </div>

        {/* Likely Root Cause */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm transition-colors">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Likely Cause
          </h3>
          <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">{result.likely_cause}</p>
        </div>
      </div>

      {/* Detailed Explanation */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm transition-colors">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detailed Explanation</h3>
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{result.explanation}</p>
      </div>

      {/* Important Error Lines */}
      {result.important_lines && result.important_lines.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2 shadow-sm transition-colors">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key Error Lines Extracted</h3>
          <div className="space-y-1.5 font-mono text-xs">
            {result.important_lines.map((line, idx) => (
              <div key={idx} className="p-2.5 rounded bg-rose-50 dark:bg-slate-950 border border-rose-200 dark:border-slate-800 text-rose-700 dark:text-rose-300">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Possible Causes List */}
      {result.possible_causes && result.possible_causes.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm transition-colors">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Possible Root Causes</h3>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {result.possible_causes.map((cause, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-2 shrink-0"></span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Solutions */}
      {result.solutions && result.solutions.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm transition-colors">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Recommended Solutions
          </h3>
          <div className="space-y-3">
            {result.solutions.map((sol, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-1">
                <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">{sol.title}</h4>
                <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{sol.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Corrected Code Snippet */}
      {result.fixed_code && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Corrected Code Fix
          </h3>
          <CodeBlock code={result.fixed_code} language={record.language || 'Code Fix'} />
        </div>
      )}

      {/* Step-by-Step Debugging Checklist */}
      {result.debug_steps && result.debug_steps.length > 0 && (
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm transition-colors">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ListChecks className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Step-by-Step Debugging Checklist
          </h3>
          <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {result.debug_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Developer Community & Stack Overflow Search Guide */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-100 to-indigo-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-indigo-950/20 border border-amber-300/40 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-md transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-xs">SO</span>
              Stack Overflow & Community Debugging Guide
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Explore similar resolved threads, official documentation, and open-source solutions for this exact error.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://stackoverflow.com/search?q=${encodeURIComponent(`${result.error_type} ${record.language || ''} ${result.important_lines?.[0] || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-sm"
            >
              <span>Search Stack Overflow</span>
            </a>

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(`${result.error_type} fix ${record.language || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <span>Search Google</span>
            </a>

            <a
              href={`https://github.com/search?q=${encodeURIComponent(`${result.error_type} ${record.language || ''}`)}&type=issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <span>GitHub Issues</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
