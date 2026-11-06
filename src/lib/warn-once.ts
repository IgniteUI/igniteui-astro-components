const warned = new Set<string>();

/** Logs each build warning message once per process. */
export function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}
