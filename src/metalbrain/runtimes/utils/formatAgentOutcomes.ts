import { formatAgentGroups } from "#metalbrain/runtimes/utils/formatAgentGroups";
import type { AgentRun } from "#metalbrain/runtimes/types/AgentRun";
import type { ModelFacts } from "#metalbrain/runtimes/types/ModelFacts";

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
