import React from 'react';
import { Terminal, Shield, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950 py-8 text-xs text-slate-500 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-300">AI Error Explainer</span>
          <span>— Production Developer Debugging Utility</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Redaction Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>SQLite Async Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
