import type { WordCaps } from "#metalbrain/records/index";
import type { Agent } from "#metalbrain/runtimes/types/Agent";
import type { Gate } from "#metalbrain/runtimes/types/Gate";
import type { SubagentCacheTtl } from "#metalbrain/runtimes/types/SubagentCacheTtl";
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
  readonly wordCaps: WordCaps;
  readonly gate: Gate;
}
