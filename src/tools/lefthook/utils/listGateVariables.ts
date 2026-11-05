import { flatMap } from "@auaust/primitive-kit/arrays";
import { getOwn } from "@auaust/toolkit/object";

import { agentShellVariables } from "#tools/agents/constants";
import type { ResolvedAgents } from "#tools/agents/index";

export function listGateVariables({
  preferred = [],
  gate,
}: Pick<ResolvedAgents, "preferred" | "gate">): readonly string[] {
  if (gate.hook === false) {
    return [];
  }

  return flatMap(preferred, (agent) => {
    const variable = getOwn(agentShellVariables, agent);

    return variable === undefined ? [] : [variable];
  });
}
