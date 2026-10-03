import React from 'react';
import { Cpu, ShieldCheck, Zap, Database } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-slate-100 sm:text-4xl">About AI Error Explainer</h1>
        <p className="mt-3 text-slate-400 max-w-xl mx-auto">
          An opinionated developer utility built to transform cryptic stack traces into actionable debugging insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-lg mb-2">Pluggable AI Architecture</h3>
          <p className="text-slate-400 text-sm">
            Supports OpenAI (`gpt-4o-mini`), Google Gemini (`gemini-1.5-flash`), Anthropic Claude, and offline mock analysis via server environment variables.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-lg mb-2">Privacy & Secret Redaction</h3>
          <p className="text-slate-400 text-sm">
            Server-side token filters automatically redact JWTs, AWS secret keys, database connection strings, and private RSA keys before AI processing.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-lg mb-2">Strict JSON Validation</h3>
          <p className="text-slate-400 text-sm">
            AI responses are parsed and validated against strict Zod schemas with fallback recovery to ensure zero server crashes.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-200 text-lg mb-2">SQLite Persistence</h3>
          <p className="text-slate-400 text-sm">
            Analysis records are stored in an embedded SQLite database with automatic migrations for fast history retrieval.
          </p>
        </div>
      </div>
    </div>
  );
};
