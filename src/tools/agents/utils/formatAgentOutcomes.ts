import { formatAgentGroups } from "#tools/agents/utils/formatAgentGroups";
import type { AgentRun, ModelFacts } from "#metalbrain/runtimes/index";

const unrecorded = "-";

export function formatAgentOutcomes(
  runs: readonly AgentRun[],
  facts: ModelFacts,
): string {
  const byOutcome = runs.map((run) => {
    return {
      run,
      group: run.outcome ?? unrecorded,
      usage: run.models,
    };
  });

  const byRole = runs.map((run) => {
    return {
      run,
      group: `${run.role}: ${run.outcome ?? unrecorded}`,
      usage: run.models,
    };
  });

  return [
    formatAgentGroups("Outcome", byOutcome, facts),
    formatAgentGroups("Role: outcome", byRole, facts),
  ].join("\n\n");
}
