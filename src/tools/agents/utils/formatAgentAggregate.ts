import { formatAgentCost } from "#tools/agents/utils/formatAgentCost";
import { formatCount } from "#tools/agents/utils/formatCount";
import { formatMarkdownTable } from "#tools/agents/utils/formatMarkdownTable";
import { priceAgentUsage } from "#tools/agents/utils/priceAgentUsage";
import { weighAgentUsage } from "#tools/agents/utils/weighAgentUsage";
import type { ModelFacts } from "#tools/agents/metalbrain/index";
import type { AgentModelUsage } from "#tools/agents/types/AgentModelUsage";
import type { AgentRun } from "#tools/agents/types/AgentRun";

interface AggregateEntry {
  readonly run: AgentRun;
  readonly group: string;
  readonly usage: readonly AgentModelUsage[];
}

function formatGroups(
  label: string,
  entries: readonly AggregateEntry[],
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

export function formatAgentAggregate(
  runs: readonly AgentRun[],
  facts: ModelFacts,
): string {
  const byRole = runs.map((run) => {
    return {
      run,
      group: run.role,
      usage: run.models,
    };
  });

  const byModel = runs.flatMap((run) => {
    return run.models.map((entry) => {
      return {
        run,
        group: entry.model,
        usage: [entry],
      };
    });
  });

  const byDay = runs.map((run) => {
    return {
      run,
      group: run.started?.slice(0, 10) ?? "?",
      usage: run.models,
    };
  });

  return [
    formatGroups("Role", byRole, facts),
    formatGroups("Model", byModel, facts),
    formatGroups("Day", byDay, facts),
  ].join("\n\n");
}
