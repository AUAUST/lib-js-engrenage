import { difference, isNonEmptyArray, map } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { agentsSchema } from "#tools/agents/config/schemas/agentsSchema";
import { filterAgents } from "#tools/agents/utils/filterAgents";
import type { ResolvedAgents } from "#metalbrain/runtimes/index";
import type { ConfigResolver } from "#project/config/index";

export const agentsSection = declareSection({
  declaration: agentsSchema,
  async resolve(input, config: ConfigResolver): Promise<ResolvedAgents> {
    const agents = agentsSchema.resolve(input, undefined, "agents");

    const runtimes = await config.context.registry.contributions(
      "agents.runtimes",
      config,
    );

    const names = map(runtimes, ({ entry }) => entry.name);

    const { preferred } = agents;

    const unknown = difference(preferred ?? [], names);

    if (isNonEmptyArray(unknown)) {
      throw new Error(
        `agents.preferred lists ${unknown.join(", ")}, which no active agent runtime contributes; active runtimes: ${names.length > 0 ? names.join(", ") : "none"}`,
      );
    }

    return freeze({
      ...agents,
      preferred: preferred === undefined
        ? undefined
        : filterAgents(preferred, names),
    });
  },
});
