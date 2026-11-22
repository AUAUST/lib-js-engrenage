import type { Agent } from "#metalbrain/runtimes/index";
import type { Budgets } from "#tools/agents/types/Budgets";
import type { Gate } from "#tools/agents/types/Gate";
import type { SubagentCacheTtl } from "#tools/agents/types/SubagentCacheTtl";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

/**
 * The resolved `agents` config section. `preferred` is `undefined` when unset,
 * and resolution fails when it names a runtime no active extension registers.
 */
export interface ResolvedAgents {
  readonly preferred: readonly Agent[] | undefined;
  readonly instructionFiles: Globs;
  readonly snippetsDir: Directory | undefined;
  readonly claudeSettings: boolean | undefined;
  readonly attribution: boolean | undefined;
  readonly subagentCacheTtl: SubagentCacheTtl;
  readonly outputLimit: number;
  readonly budgets: Budgets;
  readonly gate: Gate;
}
