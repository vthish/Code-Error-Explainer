import React from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-slate-800 rounded-md"></div>
          <div className="h-4 w-64 bg-slate-800/60 rounded-md"></div>
        </div>
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 animate-spin">
          <Sparkles className="w-5 h-5" />
        </div>
      </div>

      {/* Main Diagnosis Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="h-4 w-28 bg-slate-800 rounded-md"></div>
          <div className="h-16 w-full bg-slate-800/40 rounded-md"></div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="h-4 w-32 bg-slate-800 rounded-md"></div>
          <div className="h-16 w-full bg-slate-800/40 rounded-md"></div>
        </div>
      </div>

      {/* Solutions Skeleton */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="h-5 w-44 bg-slate-800 rounded-md"></div>
        <div className="h-12 w-full bg-slate-800/30 rounded-md"></div>
        <div className="h-12 w-full bg-slate-800/30 rounded-md"></div>
      </div>
    </div>
  );
};
