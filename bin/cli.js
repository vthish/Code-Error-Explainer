#!/usr/bin/env node

/**
 * Code Error Explainer CLI
 * Usage:
 *   node bin/cli.js "TypeError: Cannot read properties of undefined"
 *   node bin/cli.js error.log
 *   npm test 2>&1 | node bin/cli.js
 */

import fs from 'fs';

const API_URL = process.env.EXPLAINER_API_URL || 'https://code-error-explainer-backend.onrender.com/api/analyze';

async function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let errorText = '';

  if (args.length > 0) {
    const inputArg = args.join(' ');
    if (fs.existsSync(inputArg)) {
      errorText = fs.readFileSync(inputArg, 'utf-8');
    } else {
      errorText = inputArg;
    }
  } else if (!process.stdin.isTTY) {
    errorText = await readStdin();
  }

  if (!errorText || errorText.trim().length === 0) {
    console.log(`
\x1b[32m\x1b[1m⚡ Code Error Explainer CLI v1.0\x1b[0m
Automated AI error log & stack trace analyzer

\x1b[1mUsage:\x1b[0m
  node bin/cli.js "TypeError: Cannot read properties of undefined"
  node bin/cli.js ./build.log
  npm run build 2>&1 | node bin/cli.js

\x1b[1mOptions:\x1b[0m
  EXPLAINER_API_URL    Custom backend endpoint
`);
    process.exit(0);
  }

  console.log('\x1b[36m🔍 Analyzing error with Code Error Explainer AI...\x1b[0m\n');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error_text: errorText.trim() }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`\x1b[31m❌ API Request Failed (${response.status}):\x1b[0m ${err}`);
      process.exit(1);
    }

    const data = await response.json();
    const res = data.result || data;

    console.log(`\x1b[32m\x1b[1m=====================================================\x1b[0m`);
    console.log(`\x1b[1m🚨 Error Type:\x1b[0m     \x1b[33m${res.error_type || 'Unknown'}\x1b[0m (\x1b[35m${(res.severity || 'medium').toUpperCase()}\x1b[0m)`);
    console.log(`\x1b[1m💡 Summary:\x1b[0m        ${res.summary}`);
    console.log(`\x1b[1m🎯 Likely Cause:\x1b[0m   ${res.likely_cause}`);
    console.log(`\x1b[32m\x1b[1m=====================================================\x1b[0m\n`);

    if (res.solutions && res.solutions.length > 0) {
      console.log(`\x1b[32m\x1b[1m🛠️  Recommended Solutions:\x1b[0m`);
      res.solutions.forEach((sol, idx) => {
        console.log(`  ${idx + 1}. \x1b[1m${sol.title}\x1b[0m`);
        console.log(`     ${sol.description}\n`);
      });
    }

    if (res.fixed_code) {
      console.log(`\x1b[36m\x1b[1m💻 Suggested Code Fix:\x1b[0m`);
      console.log(`-----------------------------------------------------`);
      console.log(res.fixed_code);
      console.log(`-----------------------------------------------------\n`);
    }

    if (res.debug_steps && res.debug_steps.length > 0) {
      console.log(`\x1b[34m\x1b[1m📋 Debugging Steps:\x1b[0m`);
      res.debug_steps.forEach((step, idx) => {
        console.log(`  [${idx + 1}] ${step}`);
      });
      console.log('');
    }

    console.log(`\x1b[90mAnalysis ID: ${data.id || 'N/A'} | Web UI: https://code-error-explainer-frontend.onrender.com\x1b[0m`);
  } catch (err) {
    console.error(`\x1b[31m❌ Analysis failed:\x1b[0m`, err.message || err);
    process.exit(1);
  }
}

main();
