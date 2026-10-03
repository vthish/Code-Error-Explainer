import React from 'react';
import { AnalysisRecordDTO } from '../../types';
import { AnalyzerResult } from '../analyzer/AnalyzerResult';
import { X } from 'lucide-react';

interface HistoryDetailModalProps {
  record: AnalysisRecordDTO | null;
  onClose: () => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto p-6 space-y-6">
        {/* Close Button */}
        <div className="sticky top-0 right-0 flex justify-between items-center pb-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md z-10">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Saved Error Analysis Detail</h3>
            <p className="text-xs text-slate-400">Recorded on {new Date(record.created_at).toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Results Card */}
        <AnalyzerResult record={record} />
      </div>
    </div>
  );
};
