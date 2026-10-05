import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../src/utils/languageDetector.js';

describe('Universal Language Detector Suite', () => {
  it('detects Python from traceback and standard exceptions', () => {
    expect(detectLanguage('Traceback (most recent call last):\n  File "main.py", line 4\nKeyError: "id"')).toBe('Python');
    expect(detectLanguage('IndexError: list index out of range')).toBe('Python');
    expect(detectLanguage("AttributeError: 'NoneType' object has no attribute 'get'")).toBe('Python');
    expect(detectLanguage('ZeroDivisionError: division by zero')).toBe('Python');
    expect(detectLanguage('ValueError: invalid literal for int() with base 10: "abc"')).toBe('Python');
    expect(detectLanguage('TypeError: unsupported operand type(s) for +: "int" and "str"')).toBe('Python');
    expect(detectLanguage('ModuleNotFoundError: No module named "flask"')).toBe('Python');
    expect(detectLanguage('IndentationError: expected an indented block')).toBe('Python');
    expect(detectLanguage('UnboundLocalError: local variable "total" referenced before assignment')).toBe('Python');
  });

  it('detects Python from code context', () => {
    expect(detectLanguage('Runtime error', 'def calculate_total(items):\n    return sum(self.price for x in items)')).toBe('Python');
  });

  it('detects Java from stack traces and classes', () => {
    expect(detectLanguage('java.lang.NullPointerException\n  at com.example.MyService.execute(MyService.java:23)')).toBe('Java');
    expect(detectLanguage('Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5')).toBe('Java');
    expect(detectLanguage('Caused by: org.springframework.beans.factory.NoSuchBeanDefinitionException')).toBe('Java');
    expect(detectLanguage('OutOfMemoryError: Java heap space')).toBe('Java');
  });

  it('detects Java from code context', () => {
    expect(detectLanguage('Compiler failure', 'public static void main(String[] args) {\n    System.out.println("Hello");\n}')).toBe('Java');
  });

  it('detects Rust from borrow errors, cargo, and syntax', () => {
    expect(detectLanguage('error[E0502]: cannot borrow `data` as mutable because it is also borrowed as immutable')).toBe('Rust');
    expect(detectLanguage('error[E0382]: use of moved value: `s`')).toBe('Rust');
    expect(detectLanguage('cargo build failed with exit code 101')).toBe('Rust');
    expect(detectLanguage("panicked at 'called `Option::unwrap()` on a `None` value', src/main.rs:18:9")).toBe('Rust');
  });

  it('detects Go from panic, goroutines, and compiler errors', () => {
    expect(detectLanguage('panic: runtime error: index out of range [3] with length 3\ngoroutine 1 [running]:')).toBe('Go');
    expect(detectLanguage('cannot use "hello" (untyped string constant) as int value in argument to process')).toBe('Go');
    expect(detectLanguage('undefined: fmt.Println')).toBe('Go');
    expect(detectLanguage('imported and not used: "strings"')).toBe('Go');
  });

  it('detects C++ from compiler errors, stdlib, and segfaults', () => {
    expect(detectLanguage("error: 'cout' was not declared in this scope; did you mean 'std::cout'?")).toBe('C++');
    expect(detectLanguage("undefined reference to `main'")).toBe('C++');
    expect(detectLanguage('fatal error: iostream: No such file or directory')).toBe('C++');
    expect(detectLanguage('Segmentation fault (core dumped)')).toBe('C++');
    expect(detectLanguage('#include <vector>\nint main() { std::cout << "test"; }')).toBe('C++');
  });

  it('detects C# from compiler errors and .NET exceptions', () => {
    expect(detectLanguage('CS1002: ; expected')).toBe('C#');
    expect(detectLanguage("CS0103: The name 'userId' does not exist in the current context")).toBe('C#');
    expect(detectLanguage('System.NullReferenceException: Object reference not set to an instance of an object.')).toBe('C#');
    expect(detectLanguage('System.InvalidOperationException: Sequence contains no elements')).toBe('C#');
    expect(detectLanguage('at Program.cs:line 42')).toBe('C#');
  });

  it('detects TypeScript from TS codes and typing annotations', () => {
    expect(detectLanguage("TS2322: Type 'string' is not assignable to type 'number'.")).toBe('TypeScript');
    expect(detectLanguage("TS2304: Cannot find name 'React'.")).toBe('TypeScript');
    expect(detectLanguage("Property 'items' does not exist on type 'ApiResponse'.")).toBe('TypeScript');
    expect(detectLanguage('Error at line 14', 'interface User {\n  id: number;\n  name: string;\n}')).toBe('TypeScript');
  });

  it('detects JavaScript from runtime errors and stack traces', () => {
    expect(detectLanguage("TypeError: Cannot read properties of undefined (reading 'map')")).toBe('JavaScript');
    expect(detectLanguage("TypeError: Cannot set property 'onclick' of null")).toBe('JavaScript');
    expect(detectLanguage('TypeError: data.filter is not a function')).toBe('JavaScript');
    expect(detectLanguage("ReferenceError: window is not defined")).toBe('JavaScript');
    expect(detectLanguage("SyntaxError: Unexpected token '<'")).toBe('JavaScript');
    expect(detectLanguage("SyntaxError: Identifier 'myVar' has already been declared")).toBe('JavaScript');
    expect(detectLanguage('npm ERR! code ENOENT')).toBe('JavaScript');
    expect(detectLanguage('[vite] Internal server error: Failed to parse source')).toBe('JavaScript');
  });

  it('detects PHP from fatal errors, notices, and syntax', () => {
    expect(detectLanguage('PHP Fatal error: Uncaught Error: Call to undefined function wp_head()')).toBe('PHP');
    expect(detectLanguage("PHP Parse error: syntax error, unexpected '$user'")).toBe('PHP');
    expect(detectLanguage('Fatal error: Uncaught TypeError: Argument 1 passed to test() must be string')).toBe('PHP');
    expect(detectLanguage('Stack trace:\n#0 /var/www/html/index.php(15): test()')).toBe('PHP');
  });

  it('detects Ruby from NoMethodError and gems', () => {
    expect(detectLanguage("NoMethodError: undefined method 'email' for nil:NilClass")).toBe('Ruby');
    expect(detectLanguage("undefined local variable or method 'user' for #<HomeController:0x0000>")).toBe('Ruby');
    expect(detectLanguage('LoadError: cannot load such file -- bundler')).toBe('Ruby');
    expect(detectLanguage('at app/controllers/users_controller.rb:25')).toBe('Ruby');
  });

  it('detects SQL from database errors and syntax', () => {
    expect(detectLanguage('ERROR: duplicate key value violates unique constraint "users_email_key"')).toBe('SQL');
    expect(detectLanguage('ERROR: relation "customers" does not exist')).toBe('SQL');
    expect(detectLanguage('ERROR 1064 (42000): You have an error in your SQL syntax near "WHERE id = 1"')).toBe('SQL');
    expect(detectLanguage('sqlite3.OperationalError: no such table: auth_user')).toBe('SQL');
  });

  it('detects Shell / Bash', () => {
    expect(detectLanguage('zsh: command not found: pnpm')).toBe('Shell/Bash');
    expect(detectLanguage('bash: /usr/local/bin/node: No such file or directory')).toBe('Shell/Bash');
    expect(detectLanguage("chmod: cannot access 'deploy.sh': Permission denied")).toBe('Shell/Bash');
  });

  it('detects Docker', () => {
    expect(detectLanguage('Error starting userland proxy: listen tcp4 0.0.0.0:8080: bind: address already in use')).toBe('Docker');
    expect(detectLanguage('failed to solve with frontend dockerfile: failed to read dockerfile')).toBe('Docker');
    expect(detectLanguage('docker: Error response from daemon: Container is not running')).toBe('Docker');
  });

  it('returns null for empty or completely ambiguous input', () => {
    expect(detectLanguage('')).toBeNull();
    expect(detectLanguage(undefined)).toBeNull();
    expect(detectLanguage('something failed')).toBeNull();
  });

  it('MockAIProvider automatically populates detected_language when language is omitted', async () => {
    const { MockAIProvider } = await import('../src/services/ai/providers/mockProvider.js');
    const mock = new MockAIProvider();
    
    // Python KeyError
    const pyRes = await mock.analyzeError({
      error_text: 'KeyError: "user_id"',
    });
    expect(pyRes.detected_language).toBe('Python');

    // C++ error
    const cppRes = await mock.analyzeError({
      error_text: "error: 'cout' was not declared in this scope",
    });
    expect(cppRes.detected_language).toBe('C++');

    // Java NullPointerException
    const javaRes = await mock.analyzeError({
      error_text: 'java.lang.NullPointerException at com.app.Main.run(Main.java:12)',
    });
    expect(javaRes.detected_language).toBe('Java');
  });
});
