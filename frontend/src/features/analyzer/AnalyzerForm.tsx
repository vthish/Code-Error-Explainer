import React, { useState } from 'react';
import { AnalysisInput } from '../../types';
import { SAMPLE_ERRORS, SUPPORTED_LANGUAGES, SUPPORTED_FRAMEWORKS, SUPPORTED_ENVIRONMENTS, SUPPORTED_OS } from '../../utils/samples';
import { Sparkles, Code, ChevronDown, ChevronUp, RotateCcw, AlertCircle } from 'lucide-react';

interface AnalyzerFormProps {
  onSubmit: (input: AnalysisInput) => void;
  isLoading: boolean;
}

export const AnalyzerForm: React.FC<AnalyzerFormProps> = ({ onSubmit, isLoading }) => {
  const [errorText, setErrorText] = useState('');
  const [language, setLanguage] = useState('');
  const [framework, setFramework] = useState('');
  const [environment, setEnvironment] = useState('');
  const [os, setOs] = useState('');
  const [codeContext, setCodeContext] = useState('');
  const [showCodeContext, setShowCodeContext] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSampleClick = (sample: typeof SAMPLE_ERRORS[0]) => {
    setErrorText(sample.error_text);
    setLanguage(sample.language || '');
    setFramework(sample.framework || '');
    if (sample.code_context) {
      setCodeContext(sample.code_context);
      setShowCodeContext(true);
    }
    setValidationError('');
  };

  const handleClear = () => {
    setErrorText('');
    setLanguage('');
    setFramework('');
    setEnvironment('');
    setOs('');
    setCodeContext('');
    setShowCodeContext(false);
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorText.trim()) {
      setValidationError('Please paste an error log, stack trace, or compiler error before analyzing.');
      return;
    }

    setValidationError('');
    onSubmit({
      error_text: errorText.trim(),
      language: language || undefined,
      framework: framework || undefined,
      environment: environment || undefined,
      os: os || undefined,
      code_context: showCodeContext && codeContext.trim() ? codeContext.trim() : undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl backdrop-blur-md mb-8 transition-colors">
      {/* Sample Error Presets */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Try a Quick Example Error:
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_ERRORS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSampleClick(sample)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 transition-colors"
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Error Textarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="error_text" className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              Paste Error Log or Stack Trace <span className="text-rose-500 dark:text-rose-400">*</span>
            </label>
            {errorText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <textarea
            id="error_text"
            rows={6}
            value={errorText}
            onChange={(e) => {
              setErrorText(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="TypeError: Cannot read properties of undefined (reading 'map')... or paste build logs, SQL errors, compiler output..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-y"
          />

          {validationError && (
            <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Environment Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Auto-Detect / Any</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Optional</option>
              {SUPPORTED_FRAMEWORKS.map((fw) => (
                <option key={fw} value={fw}>
                  {fw}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Environment</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Optional</option>
              {SUPPORTED_ENVIRONMENTS.map((envItem) => (
                <option key={envItem} value={envItem}>
                  {envItem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Operating System</label>
            <select
              value={os}
              onChange={(e) => setOs(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Optional</option>
              {SUPPORTED_OS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Optional Related Code Context Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowCodeContext(!showCodeContext)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{showCodeContext ? 'Hide Code Snippet Context' : '+ Add Optional Related Code Snippet'}</span>
            {showCodeContext ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showCodeContext && (
            <div className="mt-2">
              <textarea
                rows={4}
                value={codeContext}
                onChange={(e) => setCodeContext(e.target.value)}
                placeholder="Paste the surrounding function or code snippet where the error occurred..."
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Error...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Error</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
