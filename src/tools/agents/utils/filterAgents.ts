import { includes } from "@auaust/primitive-kit/arrays";

import type { Agent } from "#tools/agents/types/Agent";

// @debt narrowing a contributed name to `Agent` holds only while every contribution to `agents.runtimes` augments `Engrenage.AgentRuntimes`
export function filterAgents(
  names: readonly string[],
  runtimes: readonly string[],
): readonly Agent[] {
  return names.filter((name): name is Agent => includes(runtimes, name));
}
