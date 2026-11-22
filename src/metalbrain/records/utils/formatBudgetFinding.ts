// @debt word budgets bound records and the agent-written texts of `tools/agents` alike, so the finding sits in the record core for want of a word-budget owner below it
/**
 * The finding of a text named `subject` holding `words` words, over the `budget`
 * of its budget key `kind`.
 */
export function formatBudgetFinding({
  subject,
  kind,
  words,
  budget,
}: {
  subject: string;
  kind: string;
  words: number;
  budget: number;
}): string {
  return `${subject}: ${words} words, over the ${kind} budget of ${budget}. Link to where the detail lives or split it; never truncate decisions.`;
}
