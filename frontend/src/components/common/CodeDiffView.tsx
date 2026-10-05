import React, { useState } from 'react';
import { Copy, Check, AlignJustify, Code2 } from 'lucide-react';

interface CodeDiffViewProps {
  originalCode?: string;
  fixedCode: string;
  language?: string;
}

export const CodeDiffView: React.FC<CodeDiffViewProps> = ({ originalCode, fixedCode, language = 'code' }) => {
  const [viewMode, setViewMode] = useState<'diff' | 'fixed'>('diff');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Simple clean diff generator comparing lines
  const generateDiffLines = () => {
    if (!originalCode) {
      return fixedCode.split('\n').map((line, idx) => ({
        type: 'add' as const,
        lineNum: idx + 1,
        content: line,
      }));
    }

    const origLines = originalCode.trim().split('\n');
    const fixLines = fixedCode.trim().split('\n');
    const result: Array<{ type: 'same' | 'remove' | 'add'; lineNum?: number; content: string }> = [];

    // Removed lines (original)
    origLines.forEach((line) => {
      if (!fixLines.includes(line)) {
        result.push({ type: 'remove', content: line });
      } else {
        result.push({ type: 'same', content: line });
      }
    });

    // Added lines in fix
    fixLines.forEach((line, idx) => {
      if (!origLines.includes(line)) {
        result.push({ type: 'add', lineNum: idx + 1, content: line });
      }
    });

    return result;
  };

  const diffLines = generateDiffLines();

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md">
      {/* Diff Header Bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          <div className="flex space-x-1.5 mr-1 sm:mr-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <span className="font-mono text-slate-300 capitalize text-xs truncate">{language}</span>
          {originalCode && (
            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              Interactive Patch Diff
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {originalCode && (
            <div className="flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode('diff')}
                className={`px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors flex items-center space-x-1 ${
                  viewMode === 'diff' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlignJustify className="w-3 h-3" />
                <span>Diff</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('fixed')}
                className={`px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-medium transition-colors flex items-center space-x-1 ${
                  viewMode === 'fixed' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Fix Only</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 shrink-0"
            title="Copy Fixed Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-[11px] hidden xs:inline">Copy Fix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-3 sm:p-4 overflow-x-auto font-mono text-xs leading-relaxed max-h-96">
        {viewMode === 'fixed' || !originalCode ? (
          <pre className="text-emerald-300 whitespace-pre">
            <code>{fixedCode}</code>
          </pre>
        ) : (
          <div className="space-y-0.5">
            {diffLines.map((line, idx) => (
              <div
                key={idx}
                className={`flex items-start px-2 py-0.5 rounded text-xs ${
                  line.type === 'remove'
                    ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500'
                    : line.type === 'add'
                    ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <span className="w-5 shrink-0 select-none text-slate-500 font-mono text-[11px]">
                  {line.type === 'remove' ? '-' : line.type === 'add' ? '+' : ' '}
                </span>
                <span className="whitespace-pre overflow-x-auto">{line.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful Hint when Original Code was not provided */}
      {!originalCode && (
        <div className="px-3.5 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>💡 Paste your broken code snippet in the form to unlock the interactive side-by-side Git Diff (+ / -).</span>
        </div>
      )}
    </div>
  );
};
