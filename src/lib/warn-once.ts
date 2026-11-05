/**
 * Logs a build warning once per message for the life of the process.
 *
 * Astro runs a component's frontmatter on every render, so a warning there
 * repeats for each page that renders the same usage and, in `astro dev`, again
 * on every reload. The set lives in this module, which is evaluated once per
 * process. Each docs build (one per platform and locale) is a process of its
 * own, so every build still reports each message once.
 *
 * The message is the key: callers put the sample and the problem in it, so two
 * different problems with the same sample are both reported.
 */
const warned = new Set<string>();

export function warnOnce(message: string): void {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}
