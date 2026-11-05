import { resolveSection } from "#foundation/options/index";
import { agentsSchema } from "#tools/agents/config/schemas/agentsSchema";
import type { RawConfig } from "#project/config/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function resolveAgents(raw: RawConfig): ResolvedAgents {
  return resolveSection(agentsSchema, raw.agents, undefined, "agents");
}
