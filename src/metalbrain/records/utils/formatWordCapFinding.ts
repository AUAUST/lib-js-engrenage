// @debt word caps bound records and the agent-written texts of `tools/agents` alike, so the finding sits in the record core for want of a word-cap owner below it
/**
 * The finding of a text named `subject` holding `words` words, over the `cap`
 * of its word cap key `kind`.
 */
export function formatWordCapFinding({
  subject,
  kind,
  words,
  cap,
}: {
  subject: string;
  kind: string;
  words: number;
  cap: number;
}): string {
  return `${subject}: ${words} words, over the ${kind} word cap of ${cap}. Link to where the detail lives or split it; never truncate decisions.`;
}
