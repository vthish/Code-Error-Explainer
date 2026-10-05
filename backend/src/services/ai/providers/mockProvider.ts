import { AIProvider, AnalysisInput, AIAnalysisResult, ChatContext, ChatMessage } from '../types.js';
import { detectLanguage } from '../../../utils/languageDetector.js';

export class MockAIProvider implements AIProvider {
  public readonly name = 'mock';

  async analyzeError(input: AnalysisInput): Promise<AIAnalysisResult> {
    const errorText = input.error_text.toLowerCase().trim();
    const detectedLanguage = input.language || detectLanguage(input.error_text, input.code_context) || undefined;

    // HTTP 200 OK / Success Status Detection
    if (
      errorText === '200 ok' ||
      errorText === '200' ||
      errorText.includes('http 200') ||
      errorText.includes('200 ok') ||
      errorText.includes('201 created') ||
      errorText.includes('no error')
    ) {
      return {
        error_type: 'HTTP 200 OK (Success Status - Not An Error)',
        severity: 'low',
        detected_language: detectedLanguage,
        summary: 'The submitted input "200 OK" is an HTTP success status code, NOT a system crash or error failure.',
        explanation:
          'HTTP status code 200 OK indicates that the client request succeeded and the server responded normally without any system error or network fault.',
        likely_cause: 'Normal operation. The log indicates a successful HTTP request.',
        important_lines: [input.error_text.trim() || '200 OK'],
        possible_causes: [
          'Server processed and fulfilled the HTTP request successfully with status 200 OK.',
        ],
        solutions: [
          {
            title: 'No Error Fix Required (Success Code)',
            description: 'HTTP 200 OK represents normal successful operation. No code changes, bug fixes, or error resolution steps are required.',
          },
        ],
        fixed_code: `// HTTP 200 OK indicates successful execution.\nconsole.log("Request succeeded with status 200 OK");`,
        debug_steps: [
          'No debugging steps required for HTTP 200 OK success status.',
        ],
        confidence: 'high',
      };
    }

    // Context-sensitive mock responses based on input text
    if (errorText.includes('cannot read properties of undefined') || errorText.includes('null pointer')) {
      return {
        error_type: 'Runtime Error',
        severity: 'medium',
        detected_language: detectedLanguage || 'JavaScript',
        summary: 'The application attempted to access a property on an undefined or null value.',
        explanation:
          'In JavaScript/TypeScript, dereferencing a property on a variable that evaluates to undefined or null triggers a TypeError at runtime.',
        likely_cause: 'The target object or API response has not finished loading when property access occurred.',
        important_lines: [input.error_text.split('\n')[0] || 'TypeError: Cannot read properties of undefined'],
        possible_causes: [
          'Asynchronous data fetch is still pending.',
          'Property key name is misspelled or missing in object payload.',
          'Initial state was declared as undefined instead of null or default object.',
        ],
        solutions: [
          {
            title: 'Use Optional Chaining (?.) & Nullish Coalescing (??)',
            description: 'Guard property access with optional chaining and provide a default fallback value.',
          },
        ],
        fixed_code: input.code_context
          ? `// Defensive fix:\nconst safeData = data?.items ?? [];`
          : `const value = object?.property ?? 'default_value';`,
        debug_steps: [
          'Log the target variable prior to property access.',
          'Verify API response network tab payload structure.',
          'Ensure loading state is handled before rendering dependant UI.',
        ],
        confidence: 'high',
      };
    }

    if (errorText.includes('syntaxerror') || errorText.includes('unexpected token')) {
      return {
        error_type: 'Syntax Error',
        severity: 'high',
        detected_language: detectedLanguage,
        summary: 'The code parser encountered invalid language syntax.',
        explanation: 'Syntax errors occur when code breaks language grammar rules, such as missing brackets or quotes.',
        likely_cause: 'Missing closing parenthesis, curly brace, or unexpected character.',
        important_lines: [input.error_text.split('\n')[0] || 'SyntaxError: Unexpected token'],
        possible_causes: ['Missing closing bracket/parenthesis', 'Trailing comma in strict JSON', 'Invalid character string'],
        solutions: [
          {
            title: 'Fix Syntax Mismatch',
            description: 'Inspect the line indicated in the error and verify matching brackets and quotes.',
          },
        ],
        fixed_code: null,
        debug_steps: ['Check line number in stack trace', 'Use an IDE syntax highlighter'],
        confidence: 'high',
      };
    }

    // HTTP 404 Not Found Error Handling
    if (errorText.includes('404') || errorText.includes('not found')) {
      return {
        error_type: 'HTTP 404 Not Found Error',
        severity: 'medium',
        detected_language: detectedLanguage,
        summary: 'The requested URL endpoint, API route, or web resource could not be found on the server.',
        explanation:
          'HTTP 404 Not Found indicates that the client successfully connected to the server, but the requested path or endpoint does not exist or has moved.',
        likely_cause: 'The target API route is misspelled, the backend route handler is missing, or static SPA routing is not configured.',
        important_lines: [input.error_text.slice(0, 150) || 'HTTP 404 Not Found'],
        possible_causes: [
          'Misspelled API URL or incorrect HTTP method (GET vs POST).',
          'Backend route is not registered or exported in router index.',
          'Missing rewrite rules for Single Page Applications (index.html fallback).',
          'Database record or file resource with the specified ID was not found.',
        ],
        solutions: [
          {
            title: 'Verify Route Path & HTTP Method',
            description: 'Inspect the requested URL and ensure the backend routing file mounts the endpoint correctly.',
          },
          {
            title: 'Configure SPA Rewrite Rule for Static Sites',
            description: 'If deploying React/Vite, ensure server rewrites all unknown paths (/*) to /index.html.',
          },
        ],
        fixed_code: `// Express.js Route Handling Fix:\napp.get('/api/resource/:id', async (req, res) => {\n  const data = await db.find(req.params.id);\n  if (!data) return res.status(404).json({ error: 'Resource not found' });\n  res.json(data);\n});`,
        debug_steps: [
          'Test the API URL directly in Postman or cURL.',
          'Check server terminal output for 404 routing logs.',
          'Confirm environment base URL matches your backend domain.',
        ],
        confidence: 'high',
      };
    }

    // HTTP 500 Internal Server Error Handling
    if (errorText.includes('500') || errorText.includes('internal server error') || errorText.includes('502') || errorText.includes('503')) {
      return {
        error_type: 'HTTP 500 Internal Server Error',
        severity: 'high',
        detected_language: detectedLanguage,
        summary: 'The server encountered an unhandled exception or crash while processing your request.',
        explanation:
          'HTTP 500 indicates a server-side failure such as an uncaught exception, database connection error, or syntax crash on the backend.',
        likely_cause: 'Uncaught exception, null reference, or database pool failure in the backend request handler.',
        important_lines: [input.error_text.slice(0, 150) || 'HTTP 500 Internal Server Error'],
        possible_causes: [
          'Uncaught promise rejection or missing try/catch block in backend handler.',
          'Database server connection timeout or invalid query schema.',
          'Missing server environment variables (e.g., DATABASE_URL, API_KEY).',
        ],
        solutions: [
          {
            title: 'Add Try/Catch & Global Error Handling Middleware',
            description: 'Wrap backend route logic in try/catch blocks and pass exceptions to Express error handler.',
          },
        ],
        fixed_code: `// Express.js Error Catching Handler:\napp.use((err, req, res, next) => {\n  console.error('Server error:', err);\n  res.status(500).json({ error: 'Internal Server Error', message: err.message });\n});`,
        debug_steps: [
          'Inspect server log outputs in deployment dashboard (e.g. Render/Docker logs).',
          'Verify database credentials and connection status.',
          'Check if required environment variables are set.',
        ],
        confidence: 'high',
      };
    }

    // CORS Error Handling
    if (errorText.includes('cors') || errorText.includes('access-control-allow-origin')) {
      return {
        error_type: 'CORS Policy Security Error',
        severity: 'high',
        detected_language: detectedLanguage,
        summary: 'The browser blocked a cross-origin request because the server did not send matching CORS headers.',
        explanation:
          'Browsers enforce Same-Origin Policy (SOP). If your frontend domain makes requests to a different backend domain, the backend must return Access-Control-Allow-Origin headers.',
        likely_cause: 'Backend CORS middleware is missing or FRONTEND_ORIGIN does not match your frontend domain.',
        important_lines: [input.error_text.slice(0, 150)],
        possible_causes: [
          'Backend is missing Access-Control-Allow-Origin header.',
          'Frontend domain origin mismatch in CORS configuration.',
          'Missing OPTIONS preflight request handling in backend.',
        ],
        solutions: [
          {
            title: 'Enable CORS Middleware on Backend',
            description: 'Configure Express CORS middleware to allow your frontend domain origin.',
          },
        ],
        fixed_code: `// Node.js Express CORS setup:\nimport cors from 'cors';\napp.use(cors({\n  origin: ['https://your-frontend.onrender.com', 'http://localhost:5173'],\n  credentials: true\n}));`,
        debug_steps: [
          'Check Response Headers in Browser Developer Tools Network tab.',
          'Verify backend ALLOWED_ORIGINS setting.',
        ],
        confidence: 'high',
      };
    }

    // Python KeyError Handling
    if (errorText.includes('keyerror') || errorText.includes("keyerror:")) {
      return {
        error_type: 'Python KeyError (Missing Dictionary Key)',
        severity: 'medium',
        detected_language: detectedLanguage || 'Python',
        summary: 'A dictionary key was accessed that does not exist in the dictionary payload.',
        explanation:
          'In Python, accessing a non-existent key using bracket notation dict["key"] raises a KeyError at runtime when the key is missing or nested payload structure is different than expected.',
        likely_cause: 'The target dictionary key is missing or nested under a different property in the incoming payload.',
        important_lines: [input.error_text.split('\n').find((l) => l.toLowerCase().includes('keyerror')) || "KeyError: 'metadata'"],
        possible_causes: [
          'The incoming JSON payload omitted the requested key.',
          'The key is named differently or has a typo.',
          'Nested object is None or dictionary is empty.',
        ],
        solutions: [
          {
            title: 'Use .get() with Defensive Fallback',
            description: 'Access dictionary values safely using dict.get("key", default) or safe dictionary navigation.',
          },
        ],
        fixed_code: input.code_context
          ? `@app.post("/transaction")\nasync def process_transaction(payload: dict):\n    # Defensive dictionary lookup:\n    user_metadata = payload.get("user", {}).get("metadata", {})\n    user_id = user_metadata.get("id")\n    return {"status": "ok", "user_id": user_id}`
          : `# Safe lookup:\nuser_id = payload.get("user", {}).get("metadata", {}).get("id")`,
        debug_steps: [
          'Print or log incoming payload before key access: print("Payload:", payload)',
          'Verify request body matches schema / Pydantic model validation.',
          'Use .get() instead of bracket notation for optional fields.',
        ],
        confidence: 'high',
      };
    }

    // Rust Borrow Checker Error Handling
    if (errorText.includes('cannot borrow') && errorText.includes('borrowed as immutable')) {
      return {
        error_type: 'Rust Borrow Checker Violation (E0502)',
        severity: 'high',
        detected_language: detectedLanguage || 'Rust',
        summary: 'Cannot borrow variable as mutable while an active immutable reference still exists.',
        explanation:
          'Rust enforces strict aliasing rules: you can have any number of immutable references (&T) OR exactly one mutable reference (&mut T), but not both simultaneously in overlapping scopes.',
        likely_cause: 'data.push() attempts a mutable borrow while reference is still in scope and used later.',
        important_lines: [input.error_text.split('\n').find((l) => l.includes('E0502')) || 'error[E0502]: cannot borrow `data` as mutable'],
        possible_causes: [
          'Mutable operation occurs before the last read of an immutable borrow.',
          'Lifetime of immutable borrow spans across mutable method call.',
        ],
        solutions: [
          {
            title: 'Reorder Statements or Scope Borrows',
            description: 'Finish reading from the immutable borrow before mutating the vector, or isolate references.',
          },
        ],
        fixed_code: `fn main() {\n    let mut data = vec![1, 2, 3];\n    // Push first before creating immutable reference:\n    data.push(42);\n    let reference = &data;\n    println!("{:?}", reference);\n}`,
        debug_steps: [
          'Examine where the immutable borrow begins and where its last use is.',
          'Reorder mutations before borrows or place borrows in isolated scopes.',
        ],
        confidence: 'high',
      };
    }

    // Docker Port Binding Failure
    if (errorText.includes('bind: address already in use') || errorText.includes('driver failed programming external connectivity')) {
      return {
        error_type: 'Docker Port Conflict Error',
        severity: 'medium',
        detected_language: detectedLanguage || 'Docker',
        summary: 'Docker failed to bind container port because the host port is already occupied by another process.',
        explanation:
          'TCP ports can only be bound by a single listening process per network interface. The host port is already occupied by another running service.',
        likely_cause: 'Another running container or local process (Node, Nginx, or zombie Docker proxy) is using the same port.',
        important_lines: ['listen tcp4 0.0.0.0:8080: bind: address already in use'],
        possible_causes: [
          'A background container or dangling container is still running.',
          'A local dev server on host machine is occupying the port.',
          'Zombie Docker proxy process held onto the port.',
        ],
        solutions: [
          {
            title: 'Identify & Terminate Conflicting Process or Remap Port',
            description: 'Find which process is using the port and stop it, or remap host port in docker-compose / docker run.',
          },
        ],
        fixed_code: `# In docker-compose.yml or docker run, map to an alternate free port:\nports:\n  - "8081:8080" # Map host 8081 to container 8080`,
        debug_steps: [
          'Windows: netstat -ano | findstr :8080, then taskkill /PID <PID> /F',
          'Linux/macOS: lsof -i :8080 or fuser -k 8080/tcp',
          'Stop existing containers: docker ps && docker stop <container_id>',
        ],
        confidence: 'high',
      };
    }

    // PostgreSQL Unique Constraint Violation
    if (errorText.includes('violates unique constraint') || errorText.includes('duplicate key value')) {
      return {
        error_type: 'PostgreSQL Unique Constraint Violation (23505)',
        severity: 'medium',
        detected_language: detectedLanguage || 'SQL',
        summary: 'An INSERT or UPDATE query attempted to insert duplicate data into a UNIQUE indexed column.',
        explanation:
          'The database table schema enforces uniqueness on the specified column (such as email or username), and a matching record already exists.',
        likely_cause: 'Attempted to register or insert a user record whose email address already exists in the table.',
        important_lines: ['ERROR: duplicate key value violates unique constraint "users_email_key"'],
        possible_causes: [
          'User already exists with that email address.',
          'Concurrent registration requests sent simultaneously.',
          'Missing ON CONFLICT / UPSERT handling in SQL statement.',
        ],
        solutions: [
          {
            title: 'Use ON CONFLICT (UPSERT) or Validate Before Insert',
            description: 'Handle duplicate values gracefully with ON CONFLICT DO UPDATE or return a 409 Conflict status.',
          },
        ],
        fixed_code: `-- PostgreSQL Upsert Pattern:\nINSERT INTO users (name, email)\nVALUES ('Alex', 'dev@example.com')\nON CONFLICT (email)\nDO UPDATE SET name = EXCLUDED.name, updated_at = NOW();`,
        debug_steps: [
          "Check existing records with: SELECT * FROM users WHERE email = 'dev@example.com';",
          'Add try/catch around DB insert and return 409 Conflict to client.',
        ],
        confidence: 'high',
      };
    }

    // Generic fallback mock response
    return {
      error_type: detectedLanguage ? `${detectedLanguage} Error` : (input.language ? `${input.language} Error` : 'Runtime Error'),
      severity: 'medium',
      detected_language: detectedLanguage,
      summary: `An error occurred while executing ${input.language || 'application'} code.`,
      explanation: 'The provided log indicates an unhandled runtime exception during execution.',
      likely_cause: 'State mismatch or unhandled exception path in execution.',
      important_lines: [input.error_text.slice(0, 150)],
      possible_causes: ['Unexpected payload schema', 'Environment configuration mismatch'],
      solutions: [
        {
          title: 'Add Defensive Validation',
          description: 'Validate input arguments and handle potential error branches explicitly.',
        },
      ],
      fixed_code: null,
      debug_steps: ['Check application execution logs', 'Reproduce locally with debug logs enabled'],
      confidence: 'medium',
    };
  }


  async chat(context: ChatContext, messages: ChatMessage[]): Promise<string> {
    const rawLastMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
    const lastUserMessage = rawLastMessage.toLowerCase().trim();
    const lang = (context.language || 'typescript').toLowerCase();
    const errType = context.error_type || 'Runtime Error';
    const cause = context.likely_cause || 'Unexpected data state or unhandled exception path';
    const fixCode = context.fixed_code || `// Defensive check for ${errType}\nif (!data) {\n  throw new Error("Missing required data");\n}`;

    // 1. Root Cause / "Why" / "Ai" / "Mokada" / "Reason"
    if (
      lastUserMessage.includes('why') ||
      lastUserMessage.includes('cause') ||
      lastUserMessage.includes('reason') ||
      lastUserMessage.includes('ai mehema') ||
      lastUserMessage.includes('mokada')
    ) {
      return `### 🎯 Root Cause Analysis for **${errType}**

Here is why this error occurred:
* **Primary Trigger:** \`${cause}\`
* **Execution State:** The runtime encountered an unexpected state while evaluating this code block. In ${context.language || 'modern software'}, this typically occurs when:
  1. An asynchronous promise or network call resolved with an unexpected payload shape.
  2. A required configuration variable or parameter was missing from the runtime environment.
  3. Defensive boundary checks were bypassed before accessing properties.

> 💡 **Recommendation:** Check your call stack and place a conditional breakpoint right before this line executes to inspect variable values.`;
    }

    // 2. "How to fix" / "Solution" / "Kohomada" / "Hadanne" / "Fix"
    if (
      lastUserMessage.includes('how') ||
      lastUserMessage.includes('fix') ||
      lastUserMessage.includes('solve') ||
      lastUserMessage.includes('hadanne') ||
      lastUserMessage.includes('kohomada') ||
      lastUserMessage.includes('solution')
    ) {
      return `### 🛠️ Step-by-Step Resolution Guide for **${errType}**

Follow these concrete steps to resolve the issue:

1. **Apply the patch fix:**
\`\`\`${lang}
${fixCode}
\`\`\`

2. **Validation Checklist:**
   * Verify null/undefined checks exist for all object chains (e.g. \`data?.property\`).
   * Wrap external API or database calls in \`try / catch\` error boundaries.
   * Provide safe default values (e.g. \`const items = payload?.items || [];\`).

3. **Re-run your test suite:** Confirm the error no longer reproduces with both valid and empty payloads.`;
    }

    // 3. Automated Tests / "Test" / "Prevent" / "Vitest" / "Jest"
    if (
      lastUserMessage.includes('test') ||
      lastUserMessage.includes('prevent') ||
      lastUserMessage.includes('unit') ||
      lastUserMessage.includes('vitest') ||
      lastUserMessage.includes('jest')
    ) {
      return `### 🧪 Automated Unit Test Guard for **${errType}**

Here is an automated regression test to ensure this error never occurs in production again:

\`\`\`${lang}
describe('Guard against ${errType}', () => {
  it('should handle edge cases and empty data gracefully without throwing', () => {
    // 1. Arrange edge-case input
    const edgeCaseInput = null;

    // 2. Act with defensive handler
    const safeExecution = () => {
      if (!edgeCaseInput) return 'default_fallback';
      return edgeCaseInput;
    };

    // 3. Assert no unhandled crash occurs
    expect(safeExecution).not.toThrow();
    expect(safeExecution()).toBe('default_fallback');
  });
});
\`\`\`

**Best Practice:** Add this test to your CI/CD pipeline (\`npm test\` or \`pytest\`) to prevent future regressions.`;
    }

    // 4. Simple Explanation / "Explain Simply" / "Junior" / "Therenne na"
    if (
      lastUserMessage.includes('explain') ||
      lastUserMessage.includes('simple') ||
      lastUserMessage.includes('junior') ||
      lastUserMessage.includes('therenne na') ||
      lastUserMessage.includes('plain')
    ) {
      return `### 💡 Simple Explanation (In Plain English)

Imagine you order food through a delivery app. When the courier arrives, they hand you an empty sealed bag. If you try to eat the burger inside without checking, you realize there is nothing there to take a bite out of!

* **What happened here:** Your program tried to open or use something that was empty (\`undefined\` / \`null\` / missing).
* **The Culprit:** \`${cause}\`
* **The Quick Fix:** Always peek inside the bag first before taking a bite! (Use \`?.\` in JS or check \`if (item != null)\`).`;
    }

    // 5. Terminal Commands / "Command" / "Install" / "Terminal" / "Npm"
    if (
      lastUserMessage.includes('install') ||
      lastUserMessage.includes('command') ||
      lastUserMessage.includes('terminal') ||
      lastUserMessage.includes('npm') ||
      lastUserMessage.includes('docker')
    ) {
      return `### 💻 Terminal & Package Commands

Run the following commands in your project root to clean dependencies and rebuild:

\`\`\`bash
# 1. Clean dependencies & build artifacts
rm -rf node_modules package-lock.json

# 2. Reinstall cleanly
npm install

# 3. Rebuild and verify
npm run build
\`\`\`

If using Docker:
\`\`\`bash
docker compose down
docker compose up --build -d
\`\`\``;
    }

    // 6. Code Examples / "Example" / "Sample" / "Demo"
    if (
      lastUserMessage.includes('example') ||
      lastUserMessage.includes('sample') ||
      lastUserMessage.includes('demo') ||
      lastUserMessage.includes('code')
    ) {
      return `### 💻 Before & After Code Example

#### ❌ Before (Causes ${errType}):
\`\`\`${lang}
function processData(response) {
  // Dangerous: Will crash if response or response.user is undefined
  return response.user.profile.name;
}
\`\`\`

#### ✅ After (Safe & Robust):
\`\`\`${lang}
function processData(response) {
  // Safe: Optional chaining and fallback guarantee stability
  return response?.user?.profile?.name ?? 'Guest User';
}
\`\`\``;
    }

    // 7. Sinhala Queries ("kohomada", "mokakda", "puluwanda", "wada na", "sinhalen")
    if (
      lastUserMessage.includes('mokakda') ||
      lastUserMessage.includes('puluwanda') ||
      lastUserMessage.includes('sinhalen') ||
      lastUserMessage.includes('wada na')
    ) {
      return `### 🇱🇰 සිංහලෙන් පැහැදිලි කිරීම (Sinhala Explanation)

ඔබගේ ප්‍රශ්නය: **"${rawLastMessage}"**

* **Error එක:** **${errType}**
* **හේතුව:** \`${cause}\`
* **විසඳුම:** Code එක run වෙද්දී අදාළ data variable එකක් null හෝ missing වීම නිසා මෙම error එක ඇති වේ. එය විසඳීමට code එකට \`if\` check එකක් හෝ optional chaining (\`?.\`) එකතු කරන්න.

\`\`\`${lang}
${fixCode}
\`\`\`

> 💡 **සටහන:** දැනට Backend එක run වන්නේ **Mock AI Mode** එකෙනි. සම්පූර්ණ Sinhala හෝ ඕනෑම අලුත් ප්‍රශ්නයකට නිදහසේ පිළිතුරු ලබා ගැනීමට Free Google Gemini API Key එකක් \`.env\` එකට දමන්න.`;
    }

    // 8. Dynamic Fallback for any other custom question
    return `### 🤖 AI Assistant Response

**Your Question:** *" ${rawLastMessage} "*

Regarding **${errType}** in your ${context.language || 'application'}:

1. **Context Analysis:**
   * **Observed Failure:** \`${cause}\`
   * **Target Language:** \`${context.language || 'Auto-detected'}\`

2. **Actionable Recommendation:**
   Review the lines leading up to the error. Ensure all dynamic data sources, network requests, and external parameters validate incoming payloads before invoking methods or indexing properties.

3. **Recommended Fix Snippet:**
\`\`\`${lang}
${fixCode}
\`\`\`

---
> ⚡ **Tip:** You are currently using the **Smart Mock AI Provider**. To enable deep, unrestricted natural-language conversational reasoning on ANY custom question, add your free **Google Gemini API Key** in \`backend/.env\` (\`AI_PROVIDER=gemini\`).`;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
