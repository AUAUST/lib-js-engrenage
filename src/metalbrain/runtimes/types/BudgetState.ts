import type { BudgetLevel } from "#metalbrain/runtimes/types/BudgetLevel";
import type { BudgetWarning } from "#metalbrain/runtimes/types/BudgetWarning";

/**
 * A subagent's budget: its level and budget, the warnings it was given, and
 * its current contact, opened by its brief or its caller's latest message: the
 * context of the contact's first call and the index of its first warning, with
 * the transcript bytes scanned for caller messages.
 */
export interface BudgetState {
  readonly level: BudgetLevel;
  readonly budget: number;
  readonly warnings: readonly BudgetWarning[];
  readonly start: number;
  readonly opened: number;
  readonly scanned: number;
}
