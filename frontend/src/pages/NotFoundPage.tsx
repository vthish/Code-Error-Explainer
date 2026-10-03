import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-4">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-bold text-slate-100 mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm mb-6">The requested page path does not exist in AI Error Explainer.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-medium text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Analyzer
      </Link>
    </div>
  );
};
