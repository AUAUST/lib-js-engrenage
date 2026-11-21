import { formatAgentGroups } from "#tools/agents/utils/formatAgentGroups";
import type { ModelFacts } from "#tools/agents/metalbrain/index";
import type { AgentRun } from "#tools/agents/types/AgentRun";

const unrecorded = "-";

function nameRole({ role, mode }: AgentRun): string {
  return mode === undefined ? role : `${role} ${mode}`;
}

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
      group: `${nameRole(run)}: ${run.outcome ?? unrecorded}`,
      usage: run.models,
    };
  });

  return [
    formatAgentGroups("Outcome", byOutcome, facts),
    formatAgentGroups("Role: outcome", byRole, facts),
  ].join("\n\n");
}
