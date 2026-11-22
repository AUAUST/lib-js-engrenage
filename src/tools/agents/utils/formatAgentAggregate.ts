import { formatAgentGroups } from "#tools/agents/utils/formatAgentGroups";
import type { AgentRun, ModelFacts } from "#metalbrain/runtimes/index";

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
    formatAgentGroups("Role", byRole, facts),
    formatAgentGroups("Model", byModel, facts),
    formatAgentGroups("Day", byDay, facts),
  ].join("\n\n");
}
