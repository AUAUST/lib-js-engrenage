import { round } from "@auaust/toolkit/math";

import { mainAgent, tokenWeights } from "#tools/agents/constants";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { AgentTokens } from "#tools/agents/types/AgentTokens";

function weigh(tokens: AgentTokens): number {
  return (
    tokens.input * tokenWeights.input +
    tokens.cacheRead * tokenWeights.cacheRead +
    tokens.cacheWrite5m * tokenWeights.cacheWrite5m +
    tokens.cacheWrite1h * tokenWeights.cacheWrite1h +
    tokens.output * tokenWeights.output
  );
}

function formatCount(value: number): string {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }

  return value >= 1e3 ? `${round(value / 1e3)}k` : String(value);
}

function formatMinutes({ started, ended }: AgentRun): string {
  return started === undefined || ended === undefined
    ? "?"
    : ((Date.parse(ended) - Date.parse(started)) / 60_000).toFixed(1);
}

function formatTable(
  header: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  return [header, header.map(() => "---"), ...rows]
    .map((cells) => `| ${cells.join(" | ")} |`)
    .join("\n");
}

export function formatAgentRuns(runs: readonly AgentRun[]): string {
  const total = runs.reduce((sum, run) => sum + weigh(run.tokens), 0);

  const roles = Map.groupBy(runs, (run) => run.role);

  const byRole = [...roles].map(([role, members]) => {
    const units = members.reduce((sum, run) => sum + weigh(run.tokens), 0);

    return [
      role,
      String(members.length),
      String(members.reduce((sum, run) => sum + run.turns, 0)),
      formatCount(members.reduce((sum, run) => sum + run.tokens.cacheRead, 0)),
      formatCount(
        members.reduce((sum, run) => {
          return sum + run.tokens.cacheWrite5m + run.tokens.cacheWrite1h;
        }, 0),
      ),
      formatCount(members.reduce((sum, run) => sum + run.tokens.output, 0)),
      formatCount(units),
      total === 0 ? "0%" : `${round((units / total) * 100)}%`,
    ];
  });

  const byAgent = runs
    .toSorted((left, right) => {
      return (left.started ?? "").localeCompare(right.started ?? "");
    })
    .map((run) => {
      return [
        run.agent === mainAgent ? mainAgent : run.agent.slice(0, 8),
        run.role,
        run.issue ?? "",
        run.model ?? "",
        String(run.turns),
        formatCount(run.startContext),
        formatCount(run.peakContext),
        String(run.stops),
        formatCount(weigh(run.tokens)),
        formatMinutes(run),
      ];
    });

  return [
    `Units weigh input ${tokenWeights.input}, cache read ${tokenWeights.cacheRead}, 5-minute cache write ${tokenWeights.cacheWrite5m}, 1-hour cache write ${tokenWeights.cacheWrite1h}, output ${tokenWeights.output}. Total: ${formatCount(total)} units.`,
    formatTable(
      [
        "Role",
        "Runs",
        "Turns",
        "Cache read",
        "Cache write",
        "Output",
        "Units",
        "Share",
      ],
      byRole,
    ),
    formatTable(
      [
        "Agent",
        "Role",
        "Issue",
        "Model",
        "Turns",
        "Start context",
        "Peak context",
        "Stops",
        "Units",
        "Minutes",
      ],
      byAgent,
    ),
  ].join("\n\n");
}
