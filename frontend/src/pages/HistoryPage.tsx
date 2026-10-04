import React, { useEffect, useState } from 'react';
import { AnalysisRecordDTO } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HistoryItemCard } from '../features/history/HistoryItemCard';
import { HistoryDetailModal } from '../features/history/HistoryDetailModal';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  History,
  Trash2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Lock,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<AnalysisRecordDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecordDTO | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list');

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

  // Analytics Aggregations
  const totalCount = analyses.length;
  const criticalHighCount = analyses.filter((a) => a.result.severity === 'high' || a.result.severity === 'critical').length;
  const mediumCount = analyses.filter((a) => a.result.severity === 'medium').length;
  const lowCount = analyses.filter((a) => a.result.severity === 'low').length;
  const highConfidenceCount = analyses.filter((a) => a.result.confidence === 'high').length;
  const highConfidencePercent = totalCount > 0 ? Math.round((highConfidenceCount / totalCount) * 100) : 0;
  const estimatedHoursSaved = (totalCount * 0.4).toFixed(1);

  // Error Types Breakdown
  const errorTypeMap: Record<string, number> = {};
  analyses.forEach((a) => {
    const type = a.result.error_type || 'Unknown Error';
    errorTypeMap[type] = (errorTypeMap[type] || 0) + 1;
  });
  const topErrorTypes = Object.entries(errorTypeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Languages Breakdown
  const languageMap: Record<string, number> = {};
  analyses.forEach((a) => {
    const lang = a.language || 'Auto-Detected';
    languageMap[lang] = (languageMap[lang] || 0) + 1;
  });
  const topLanguages = Object.entries(languageMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 px-4">
      {/* Auth Mode Status Banner */}
      <div className="mb-6 p-4 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
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

        {/* View Switcher Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({totalCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Developer Insights</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'analytics' ? (
        /* Analytics Dashboard View */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Developer Debugging Insights
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
              Pattern breakdown, common roadblocks, and debugging productivity analytics.
            </p>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Diagnoses</span>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalCount}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Resolved errors
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time Saved</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">~{estimatedHoursSaved} hrs</p>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> ~25 min per error
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">High/Critical</span>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{criticalHighCount}</p>
              <span className="text-[10px] text-rose-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Production blocking
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Accuracy</span>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{highConfidencePercent}%</p>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> High confidence
              </span>
            </div>
          </div>

          {/* Breakdown Section: Severity & Top Errors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Severity Breakdown */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Severity Distribution</span>
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">High / Critical</span>
                    <span className="text-slate-500">{criticalHighCount} ({totalCount ? Math.round((criticalHighCount / totalCount) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${totalCount ? (criticalHighCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Medium</span>
                    <span className="text-slate-500">{mediumCount} ({totalCount ? Math.round((mediumCount / totalCount) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${totalCount ? (mediumCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Low</span>
                    <span className="text-slate-500">{lowCount} ({totalCount ? Math.round((lowCount / totalCount) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${totalCount ? (lowCount / totalCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Frequent Error Types */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Most Frequent Error Types</h3>
              {topErrorTypes.length === 0 ? (
                <p className="text-xs text-slate-400">No error data available yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {topErrorTypes.map(([type, count], idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{type}</span>
                      <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {count} {count === 1 ? 'time' : 'times'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Languages Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Top Analyzed Programming Languages</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {topLanguages.map(([lang, count], idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{lang}</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* History List View */
        <>
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                Analysis History
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
                Review, reopen, share, or delete past AI error diagnoses.
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
        </>
      )}

      {/* Detail Modal View */}
      <HistoryDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
};
