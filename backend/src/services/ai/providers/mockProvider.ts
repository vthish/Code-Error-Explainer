import { AIProvider, AnalysisInput, AIAnalysisResult } from '../types.js';

export class MockAIProvider implements AIProvider {
  public readonly name = 'mock';

  async analyzeError(input: AnalysisInput): Promise<AIAnalysisResult> {
    const errorText = input.error_text.toLowerCase();

    // Context-sensitive mock responses based on input text
    if (errorText.includes('cannot read properties of undefined') || errorText.includes('null pointer')) {
      return {
        error_type: 'Runtime Error',
        severity: 'medium',
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

    // Generic fallback mock response
    return {
      error_type: input.language ? `${input.language} Error` : 'Runtime Error',
      severity: 'medium',
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


  async healthCheck(): Promise<boolean> {
    return true;
  }
}
