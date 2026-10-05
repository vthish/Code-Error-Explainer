/**
 * Universal Intelligent Language Detector for programming errors, stack traces,
 * compiler diagnostics, and code contexts.
 */
export function detectLanguage(errorText?: string, codeContext?: string): string | null {
  const combined = `${errorText || ''}\n${codeContext || ''}`.trim();
  if (!combined) return null;

  // 1. Python
  if (
    /Traceback \(most recent call last\)/i.test(combined) ||
    /File ".*\.py", line \d+/i.test(combined) ||
    /\.py:\d+/i.test(combined) ||
    /\b(KeyError|IndexError|ValueError|NameError|ModuleNotFoundError|ImportError|IndentationError|TabError|ZeroDivisionError|UnboundLocalError|FileNotFoundError|PermissionError|RecursionError|StopIteration|KeyboardInterrupt|NotImplementedError|UnicodeDecodeError|JSONDecodeError):/i.test(combined) ||
    /AttributeError:\s*'(NoneType|\w+)' object has no attribute/i.test(combined) ||
    /TypeError:\s*(?:unsupported operand|can only concatenate|takes \d+ positional|missing \d+ required|object of type .* has no len|'NoneType' object is not callable)/i.test(combined) ||
    /SyntaxError:\s*invalid syntax/i.test(combined) ||
    (/\b(pip|pytest|uvicorn|fastapi|pydantic|site-packages|venv|virtualenv|django|flask)\b/i.test(combined) && /(?:Error|Exception|Traceback|\.py)/i.test(combined)) ||
    (/\bdef \w+\([^)]*\):/i.test(combined) && /\b(?:self|elif|print|import|return)\b/i.test(combined))
  ) {
    return 'Python';
  }

  // 2. Rust
  if (
    /error\[E\d{4}\]:/i.test(combined) ||
    /\bcargo (?:build|run|check|test)\b/i.test(combined) ||
    /cannot borrow .* as (?:mutable|immutable)/i.test(combined) ||
    /borrow of moved value/i.test(combined) ||
    /the trait bound .* is not satisfied/i.test(combined) ||
    /panicked at '.*', (?:src\/)?.*\.rs:\d+/i.test(combined) ||
    /\.rs:\d+/i.test(combined) ||
    /\b(?:fn main\(\)|let mut |println!|pub fn |impl \w+)\b/i.test(combined)
  ) {
    return 'Rust';
  }

  // 3. Go
  if (
    /panic:\s*runtime error/i.test(combined) ||
    /goroutine \d+ \[(?:running|chan receive|semacquire)\]/i.test(combined) ||
    /cannot use .* as .* in (?:argument|return|assignment)/i.test(combined) ||
    /undefined:\s*[a-zA-Z0-9_]+/i.test(combined) ||
    /(?:not enough|too many) arguments in call to/i.test(combined) ||
    /imported and not used:\s*".*"/i.test(combined) ||
    /go:\s*missing go\.sum entry/i.test(combined) ||
    /\bgo (?:build|run|mod tidy)\b/i.test(combined) ||
    /\.go:\d+/i.test(combined) ||
    (/\bfunc main\(\)/i.test(combined) && /\bpackage main\b/i.test(combined))
  ) {
    return 'Go';
  }

  // 4. Java
  if (
    /\bjava\.lang\.[A-Za-z0-9_]+Exception\b/i.test(combined) ||
    /\bjava\.lang\.[A-Za-z0-9_]+Error\b/i.test(combined) ||
    /Exception in thread ".*"/i.test(combined) ||
    /Caused by:\s*[a-zA-Z0-9_.]*Exception/i.test(combined) ||
    /at [a-zA-Z0-9_.$]+\([a-zA-Z0-9_]+\.java:\d+\)/i.test(combined) ||
    /\.java:\d+/i.test(combined) ||
    (/\b(NullPointerException|ClassNotFoundException|NoSuchMethodError|NoClassDefFoundError|ArrayIndexOutOfBoundsException|ClassCastException|StackOverflowError)\b/i.test(combined) && !/System\.NullReferenceException/i.test(combined)) ||
    /OutOfMemoryError:\s*Java heap space/i.test(combined) ||
    (/cannot find symbol\s*(?:symbol:\s*(?:class|method|variable))?/i.test(combined) && /\bclass\b/i.test(combined)) ||
    /\b(?:org\.springframework|org\.apache|javax\.|jakarta\.)\b/i.test(combined) ||
    /\bpublic static void main\(String\[\]\s*\w*\)/i.test(combined) ||
    /\bSystem\.out\.println\(/i.test(combined)
  ) {
    return 'Java';
  }

  // 5. C# (.NET)
  if (
    /\bCS\d{4}:/i.test(combined) ||
    /\bSystem\.NullReferenceException\b/i.test(combined) ||
    /NullReferenceException:\s*Object reference not set/i.test(combined) ||
    /\bSystem\.(?:InvalidOperationException|ArgumentNullException|ArgumentException|IndexOutOfRangeException|DivideByZeroException|OverflowException)\b/i.test(combined) ||
    /at [a-zA-Z0-9_.]+\.cs:line \d+/i.test(combined) ||
    /\.cs:\d+/i.test(combined) ||
    /\bdotnet (?:build|run|watch|test)\b/i.test(combined) ||
    /\b(Microsoft\.AspNetCore|Microsoft\.EntityFrameworkCore|Newtonsoft\.Json)\b/i.test(combined) ||
    (/\bnamespace \w+/i.test(combined) && /\busing System;/i.test(combined)) ||
    /\bConsole\.WriteLine\(/i.test(combined)
  ) {
    return 'C#';
  }

  // 6. C++ & C
  if (
    /error:\s*'.*' was not declared in this scope/i.test(combined) ||
    /undefined reference to `.*'/i.test(combined) ||
    /fatal error:\s*.*:\s*No such file or directory/i.test(combined) ||
    /Segmentation fault \(core dumped\)/i.test(combined) ||
    /\b(SIGSEGV|SIGABRT|free\(\): invalid pointer|double free or corruption)\b/i.test(combined) ||
    /\b(g\+\+|clang\+\+|clang|gcc)\b.*error:/i.test(combined) ||
    /collect2:\s*error:\s*ld returned/i.test(combined) ||
    /cannot find -l[a-zA-Z0-9_]+/i.test(combined) ||
    /\.(?:cpp|cc|cxx|hpp|h):\d+/i.test(combined) ||
    /#include <(?:iostream|vector|string|memory|algorithm|map|set|cstdio|cstdlib)>/i.test(combined) ||
    /\bstd::(?:cout|cin|endl|vector|string|make_shared|unique_ptr)\b/i.test(combined) ||
    /\bcout\s*<<\s*/i.test(combined)
  ) {
    return 'C++';
  }

  // 7. PHP
  if (
    /PHP (?:Fatal error|Parse error|Warning|Notice):/i.test(combined) ||
    /Fatal error:\s*Uncaught (?:Error|TypeError|Exception)/i.test(combined) ||
    /Call to undefined function\s*\w+\(\)/i.test(combined) ||
    /Parse error:\s*syntax error/i.test(combined) ||
    /Stack trace:\s*#0 .*?\.php\(\d+\)/i.test(combined) ||
    /at \/.*?\.php:\d+/i.test(combined) ||
    /\.php:\d+/i.test(combined) ||
    /<\?php/i.test(combined) ||
    /\$[a-zA-Z_]\w*->[a-zA-Z_]\w*/i.test(combined) ||
    /\bcomposer (?:install|require|update)\b/i.test(combined)
  ) {
    return 'PHP';
  }

  // 8. Ruby
  if (
    /NoMethodError:\s*undefined method/i.test(combined) ||
    /undefined local variable or method/i.test(combined) ||
    /NameError:\s*uninitialized constant/i.test(combined) ||
    /LoadError:\s*cannot load such file/i.test(combined) ||
    /ActionView::Template::Error/i.test(combined) ||
    /ActiveRecord::\w+Error/i.test(combined) ||
    /\.rb:\d+/i.test(combined) ||
    /\bbundle exec\b/i.test(combined) ||
    (/\bdef \w+/i.test(combined) && /\bend\b/i.test(combined) && /\bputs\b/i.test(combined))
  ) {
    return 'Ruby';
  }

  // 9. SQL
  if (
    /syntax error at or near/i.test(combined) ||
    /ORA-\d{5}/i.test(combined) ||
    /psycopg2\.\w+Error/i.test(combined) ||
    /sqlite3\.OperationalError/i.test(combined) ||
    /ERROR \d{4} \([A-Z0-9]{5}\)/i.test(combined) ||
    /violates (?:unique|foreign key|check|not-null) constraint/i.test(combined) ||
    /duplicate key value violates unique constraint/i.test(combined) ||
    /(?:table|column|relation) ["'].*?["'] (?:does not exist|doesn't exist|already exists)/i.test(combined) ||
    /QueryFailedError:/i.test(combined) ||
    (/\b(SELECT|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/i.test(combined) && /\b(FROM|VALUES|SET|WHERE|JOIN)\b/i.test(combined))
  ) {
    return 'SQL';
  }

  // 10. Docker
  if (
    /failed to solve with frontend dockerfile/i.test(combined) ||
    /Dockerfile:\d+/i.test(combined) ||
    /docker:\s*Error response from daemon/i.test(combined) ||
    /Error starting userland proxy/i.test(combined) ||
    /\b(docker build|docker run|docker compose|docker-compose)\b/i.test(combined) ||
    /container .* is not running/i.test(combined)
  ) {
    return 'Docker';
  }

  // 11. Shell / Bash
  if (
    /\b(?:bash|sh|zsh):\s*/i.test(combined) ||
    /\bcommand not found/i.test(combined) ||
    /\/bin\/(?:bash|sh|zsh)/i.test(combined) ||
    /syntax error near unexpected token/i.test(combined) ||
    /\b(?:chmod|export [A-Z_]+=|\$\(which |sudo apt|sudo yum|brew install|source \.bashrc)\b/i.test(combined) ||
    /^#!\/bin\/(?:bash|sh|zsh)/m.test(combined) ||
    /\.sh:\d+/i.test(combined)
  ) {
    return 'Shell/Bash';
  }

  // 12. TypeScript vs JavaScript
  // Explicit TypeScript checks
  if (
    /\bTS\d{4}:/i.test(combined) ||
    /Type '.*' is not assignable to type/i.test(combined) ||
    /Property '.*' does not exist on type/i.test(combined) ||
    /Cannot find name '.*'/i.test(combined) ||
    /Argument of type '.*' is not assignable/i.test(combined) ||
    /\.(?:ts|tsx):\d+/i.test(combined) ||
    /\btsconfig\.json\b/i.test(combined) ||
    /\b(?:interface|type)\s+[A-Z]\w*\s*(?:=|\{)/.test(combined) ||
    /:\s*(?:string|number|boolean|any|unknown|never|Record<|Array<|Promise<)/.test(combined) ||
    /\bas const\b/.test(combined)
  ) {
    return 'TypeScript';
  }

  // JavaScript checks
  if (
    /TypeError:\s*Cannot read propert(?:ies|y)\s*of\s*(?:undefined|null)/i.test(combined) ||
    /TypeError:\s*Cannot set propert(?:ies|y)\s*.*of\s*(?:undefined|null)/i.test(combined) ||
    /TypeError:\s*.* is not a function/i.test(combined) ||
    /ReferenceError:\s*.* is not defined/i.test(combined) ||
    /SyntaxError:\s*Unexpected token/i.test(combined) ||
    /SyntaxError:\s*Identifier '.*' has already been declared/i.test(combined) ||
    /RangeError:\s*Maximum call stack size exceeded/i.test(combined) ||
    /Uncaught\s*(?:\(in promise\))?\s*(?:TypeError|ReferenceError|Error)/i.test(combined) ||
    /UnhandledPromiseRejection/i.test(combined) ||
    /at .* \([a-zA-Z0-9_./\\-]+\.(?:js|jsx|mjs|cjs):\d+:\d+\)/i.test(combined) ||
    /\.(?:js|jsx|mjs|cjs):\d+/i.test(combined) ||
    /node:internal/i.test(combined) ||
    /\bnpm (?:ERR|warn)/i.test(combined) ||
    /\b(?:yarn error|pnpm-lock)\b/i.test(combined) ||
    /\[vite\]\s*(?:Internal server error|error while processing)/i.test(combined) ||
    /\b(?:console\.log|const |let |var |document\.getElementById|window\.addEventListener)\b/i.test(combined)
  ) {
    return 'JavaScript';
  }

  // 13. Swift
  if (
    /fatal error: unexpectedly found nil while unwrapping an Optional value/i.test(combined) ||
    /Thread \d+: Fatal error:/i.test(combined) ||
    /\.swift:\d+/i.test(combined) ||
    /\bguard let\b/i.test(combined)
  ) {
    return 'Swift';
  }

  // 14. Kotlin
  if (
    /kotlin\.KotlinNullPointerException/i.test(combined) ||
    /Unresolved reference:\s*\w+/i.test(combined) ||
    /\.kt:\d+/i.test(combined) ||
    /\bfun main\(/i.test(combined)
  ) {
    return 'Kotlin';
  }

  // 15. Dart
  if (
    /Unhandled Exception:\s*Null check operator used on a null value/i.test(combined) ||
    /NoSuchMethodError:\s*The method '.*' was called on null/i.test(combined) ||
    /FlutterError/i.test(combined) ||
    /\.dart:\d+/i.test(combined)
  ) {
    return 'Dart';
  }

  return null;
}
