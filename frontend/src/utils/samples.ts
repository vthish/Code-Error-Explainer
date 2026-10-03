export interface SampleError {
  name: string;
  language: string;
  framework?: string;
  error_text: string;
  code_context?: string;
}

export const SAMPLE_ERRORS: SampleError[] = [
  {
    name: 'JS / TS Undefined .map()',
    language: 'TypeScript',
    framework: 'React',
    error_text: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (http://localhost:5173/src/components/UserList.tsx:14:22)
    at renderWithHooks (http://localhost:5173/node_modules/react-dom/cjs/react-dom.development.js:16305:18)
    at mountIndeterminateComponent (http://localhost:5173/node_modules/react-dom/cjs/react-dom.development.js:20074:13)`,
    code_context: `const UserList = ({ data }) => {
  return (
    <ul>
      {data.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};`,
  },
  {
    name: 'Python KeyError in API Payload',
    language: 'Python',
    framework: 'FastAPI',
    error_text: `Traceback (most recent call last):
  File "app/main.py", line 42, in process_transaction
    user_id = payload["user"]["metadata"]["id"]
KeyError: 'metadata'`,
    code_context: `@app.post("/transaction")
async def process_transaction(payload: dict):
    user_id = payload["user"]["metadata"]["id"]
    return {"status": "ok", "user_id": user_id}`,
  },
  {
    name: 'Rust Borrow Checker Error',
    language: 'Rust',
    framework: 'Axum',
    error_text: `error[E0502]: cannot borrow \`data\` as mutable because it is also borrowed as immutable
  --> src/main.rs:24:5
   |
21 |     let reference = &data;
   |                     ----- immutable borrow occurs here
24 |     data.push(42);
   |     ^^^^^^^^^^^^ mutable borrow occurs here
25 |     println!("{}", reference);
   |                    --------- immutable borrow later used here`,
    code_context: `fn main() {
    let mut data = vec![1, 2, 3];
    let reference = &data;
    data.push(42);
    println!("{:?}", reference);
}`,
  },
  {
    name: 'Docker Container Port Binding Failure',
    language: 'Shell/Bash',
    framework: 'Docker',
    error_text: `Error response from daemon: driver failed programming external connectivity on endpoint web_app (a1b2c3d4e5): Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use`,
  },
  {
    name: 'PostgreSQL Unique Constraint Violation',
    language: 'SQL',
    framework: 'PostgreSQL',
    error_text: `ERROR: duplicate key value violates unique constraint "users_email_key"
DETAIL: Key (email)=(dev@example.com) already exists.
STATEMENT: INSERT INTO users (name, email) VALUES ('Alex', 'dev@example.com');`,
  },
];
export const SUPPORTED_LANGUAGES = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'Java',
  'C#',
  'C++',
  'PHP',
  'Ruby',
  'SQL',
  'Shell/Bash',
];

export const SUPPORTED_FRAMEWORKS = [
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'FastAPI',
  'Django',
  'Flask',
  'Spring Boot',
  'ASP.NET',
  'Laravel',
  'Docker',
  'PostgreSQL',
];

export const SUPPORTED_ENVIRONMENTS = ['Browser', 'Node.js Runtime', 'Docker Container', 'Linux Server', 'Kubernetes', 'AWS Lambda'];

export const SUPPORTED_OS = ['macOS', 'Linux / Ubuntu', 'Windows', 'WSL2'];
