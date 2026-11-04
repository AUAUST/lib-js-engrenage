// @debt reaches into tools/agents, a higher layer than project; the layered registry (#143) removes the upward dependency
import type { Agent } from "#tools/agents/types/Agent";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export interface ResolvedAgents {
  readonly preferred: readonly Agent[] | undefined;
  readonly codexHooks: boolean | undefined;
  readonly instructionFiles: Globs;
  readonly snippetsDir: Directory | undefined;
  readonly claudeSettings: boolean | undefined;
  readonly attribution: boolean | undefined;
}
