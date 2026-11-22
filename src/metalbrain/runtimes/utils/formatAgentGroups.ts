import { formatAgentCost } from "#metalbrain/runtimes/utils/formatAgentCost";
import { formatCount } from "#metalbrain/runtimes/utils/formatCount";
import { formatMarkdownTable } from "#metalbrain/runtimes/utils/formatMarkdownTable";
import { priceAgentUsage } from "#metalbrain/runtimes/utils/priceAgentUsage";
import { weighAgentUsage } from "#metalbrain/runtimes/utils/weighAgentUsage";
import type { AgentGroupEntry } from "#metalbrain/runtimes/types/AgentGroupEntry";
import type { ModelFacts } from "#metalbrain/runtimes/types/ModelFacts";

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
