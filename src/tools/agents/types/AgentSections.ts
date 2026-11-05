import type { Filesystem } from "#foundation/filesystem/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export interface AgentSections {
  filesystem: Filesystem;
  resolve(...paths: string[]): string;
  agents: ResolvedAgents;
}
