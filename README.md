# Code-Error-Explainer

An AI-powered developer tool that analyzes error messages, stack traces, compiler errors, build logs, and environment failures to return clear plain-English summaries, root cause diagnoses, highlighted error lines, actionable fixes, and step-by-step debugging checklists.

## Architecture

- **Backend**: Node.js 22 + Express + TypeScript + SQLite (`better-sqlite3`)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
- **AI Integration**: Pluggable provider architecture supporting OpenAI, Google Gemini, Anthropic Claude, and offline mock analysis.

## Development Workflow

This project is built stage-by-stage following clean architecture and disciplined branch workflows.

* `main` - Production stable branch
* `feature/stage-1-design` - Architecture & system design
* `feature/stage-2-backend-foundation` - Express + TypeScript + SQLite foundation
