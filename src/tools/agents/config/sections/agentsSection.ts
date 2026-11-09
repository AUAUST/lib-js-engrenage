import { declareSection } from "#foundation/options/index";
import { agentsSchema } from "#tools/agents/config/schemas/agentsSchema";
import type { ResolvedAgents } from "#tools/agents/types/ResolvedAgents";

export const agentsSection = declareSection({
  declaration: agentsSchema,
  resolve(input): ResolvedAgents {
    return agentsSchema.resolve(input, undefined, "agents");
  },
});
