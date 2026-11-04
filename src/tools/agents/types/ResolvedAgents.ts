import type { Agent } from "#tools/agents/types/Agent";
import type { Budgets } from "#tools/agents/types/Budgets";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export interface ResolvedAgents {
  readonly preferred: readonly Agent[] | undefined;
  readonly codexHooks: boolean | undefined;
  readonly instructionFiles: Globs;
  readonly snippetsDir: Directory | undefined;
  readonly claudeSettings: boolean | undefined;
  readonly attribution: boolean | undefined;
  readonly budgets: Budgets;
}
