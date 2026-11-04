import { resolveSection } from "#foundation/options/utils/resolveSection";
import { agentsSchema } from "#tools/agents/config/schemas/agentsSchema";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export function resolveAgents(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedAgents {
  return resolveSection(agentsSchema, raw.agents, context, "agents");
}
