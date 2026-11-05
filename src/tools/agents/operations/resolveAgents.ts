import { resolveSection } from "#foundation/options/index";
import { agentsSchema } from "#tools/agents/config/schemas/agentsSchema";
import type { ConfigContext, RawConfig } from "#project/config/index";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function resolveAgents(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedAgents {
  return resolveSection(agentsSchema, raw.agents, context, "agents");
}
