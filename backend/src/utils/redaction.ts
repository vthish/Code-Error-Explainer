/**
  * Utility to redact sensitive tokens, API keys, passwords, and JWTs from error text
  * before passing text to external AI models or storing logs.
  */
export function redactSensitiveData(text: string): string {
  if (!text) return text;

  let redacted = text;

  // 1. Redact JWT tokens (eyJ...)
  redacted = redacted.replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_JWT]');

  // 2. Redact AWS access key IDs (AKIA...)
  redacted = redacted.replace(/\b(AKIA|ASIA)[0-9A-Z]{16}\b/g, '[REDACTED_AWS_KEY]');

  // 3. Redact Generic Bearer tokens
  redacted = redacted.replace(/(Bearer\s+)[A-Za-z0-9_\-\.\~\\+\/]+=*/gi, '$1[REDACTED_BEARER_TOKEN]');

  // 4. Redact OpenAI / Anthropic / Gemini style API keys (sk-..., AIza...)
  redacted = redacted.replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_OPENAI_KEY]');
  redacted = redacted.replace(/\bAIzaSy[A-Za-z0-9_-]{33}\b/g, '[REDACTED_GEMINI_KEY]');
  redacted = redacted.replace(/\bsk-ant-[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_ANTHROPIC_KEY]');

  // 5. Redact Connection String Passwords (postgres://user:password@host, mongodb+srv://user:pass@...)
  redacted = redacted.replace(/(:\/\/[^:]+:)([^@]+)(@)/g, '$1[REDACTED_PASSWORD]$3');

  // 6. Redact Private RSA / SSH Keys
  redacted = redacted.replace(/-----BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY-----[\s\S]*?-----END \1 PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]');

  return redacted;
}
