import React from 'react';

export const AnalyzerPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 sm:text-4xl">
          Debug Errors in Seconds with AI
        </h1>
        <p className="mt-3 text-base text-slate-400 max-w-2xl mx-auto">
          Paste any error log, stack trace, compiler error, or Docker build failure below to receive a structured diagnosis, likely causes, and copyable fix.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        Analyzer UI Foundation Ready
      </div>
    </div>
  );
};
