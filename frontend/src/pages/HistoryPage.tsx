import React, { useEffect, useState } from 'react';
import { AnalysisRecordDTO } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HistoryItemCard } from '../features/history/HistoryItemCard';
import { HistoryDetailModal } from '../features/history/HistoryDetailModal';
import { useNavigate } from 'react-router-dom';
import { Search, History, Trash2, AlertCircle, ShieldCheck, UserCheck, Lock } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecordDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecordDTO | null>(null);

  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await api.getAnalyses(50, 0);
      setAnalyses(response.data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to fetch analysis history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this analysis entry?')) return;

    try {
      await api.deleteAnalysis(id);
      setAnalyses((prev) => prev.filter((item) => item.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete record.');
    }
  };

  const handleReanalyze = (record: AnalysisRecordDTO) => {
    navigate('/', { state: { reanalyzeRecord: record } });
  };

  const filteredAnalyses = analyses.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.error_text.toLowerCase().includes(query) ||
      item.result.error_type.toLowerCase().includes(query) ||
      item.result.summary.toLowerCase().includes(query) ||
      (item.language && item.language.toLowerCase().includes(query)) ||
      (item.framework && item.framework.toLowerCase().includes(query))
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4">
      {/* Auth Mode Status Banner */}
      <div className="mb-6 p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <UserCheck className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Lock className="w-5 h-5" />
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {isLoggedIn ? `Personal History — ${user?.name}` : 'Guest Session History (Anonymous Mode)'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isLoggedIn
                ? `Showing error analysis history saved exclusively to your Google account (${user?.email}).`
                : 'Guest mode: your error history is temporary. Sign in with Google to save history permanently to your account.'}
            </p>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Analysis History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Review, reopen, or delete past AI error diagnoses.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history by keyword..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 placeholder-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Error State Banner */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span className="text-xs sm:text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5"></div>
          ))}
        </div>
      ) : filteredAnalyses.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-1">No Saved Analyses Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
            {searchQuery ? 'No past entries matched your search query.' : 'You haven’t analyzed any errors yet.'}
          </p>
        </div>
      ) : (
        /* List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnalyses.map((record) => (
            <HistoryItemCard
              key={record.id}
              record={record}
              onView={(rec) => setSelectedRecord(rec)}
              onDelete={handleDelete}
              onReanalyze={handleReanalyze}
            />
          ))}
        </div>
      )}

      {/* Detail Modal View */}
      <HistoryDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
};

