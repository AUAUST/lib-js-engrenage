import { flatMap } from "@auaust/toolkit/array";
import { getOwn } from "@auaust/toolkit/object";

import { agentShellVariables } from "#metalbrain/runtimes/constants";
import type { ResolvedAgents } from "#metalbrain/runtimes/index";

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
