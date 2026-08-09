const SENSITIVE_KEYS = /password|secret|token|cookie|authorization|api[-_]?key/i;

export function sanitizeAuditState(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (SENSITIVE_KEYS.test(key)) return [key, "[REDACTED]"];
    if (Array.isArray(entry)) return [key, entry.map((item) => typeof item === "object" && item !== null ? sanitizeAuditState(item as Record<string, unknown>) : item)];
    if (typeof entry === "object" && entry !== null) return [key, sanitizeAuditState(entry as Record<string, unknown>)];
    return [key, entry];
  }));
}
