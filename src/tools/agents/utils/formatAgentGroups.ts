import {
  formatAgentCost,
  priceAgentUsage,
  type ModelFacts,
} from "#metalbrain/runtimes/index";
import { formatCount } from "#tools/agents/utils/formatCount";
import { formatMarkdownTable } from "#tools/agents/utils/formatMarkdownTable";
import { weighAgentUsage } from "#tools/agents/utils/weighAgentUsage";
import type { AgentGroupEntry } from "#tools/agents/types/AgentGroupEntry";

export function formatAgentGroups(
  label: string,
  entries: readonly AgentGroupEntry[],
  facts: ModelFacts,
): string {
  const groups = Map.groupBy(entries, ({ group }) => group);

  const rows = [...groups]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .map(([group, members]) => {
      const usage = members.flatMap((member) => member.usage);

      return [
        group,
        String(new Set(members.map((member) => member.run)).size),
        String(usage.reduce((sum, entry) => sum + entry.calls, 0)),
        formatCount(weighAgentUsage(usage)),
        formatAgentCost(priceAgentUsage(facts, usage)),
      ];
    });

  return formatMarkdownTable([label, "Runs", "Calls", "Units", "Cost"], rows);
}
