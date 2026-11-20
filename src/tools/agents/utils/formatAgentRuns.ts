import { round } from "@auaust/toolkit/math";

import { mainAgent, tokenWeights } from "#tools/agents/constants";
import {
  findModelFact,
  priceTokens,
  type ModelFacts,
} from "#tools/agents/metalbrain/index";
import { formatCount } from "#tools/agents/utils/formatCount";
import type { AgentModelUsage } from "#tools/agents/types/AgentModelUsage";
import type { AgentResultTotals } from "#tools/agents/types/AgentResultTotals";
import type { AgentRun } from "#tools/agents/types/AgentRun";
import type { AgentTokens } from "#tools/agents/types/AgentTokens";

const largestResultCount = 10;

interface Price {
  readonly cost: number;
  readonly unpriced: readonly string[];
}

function weighTokens(tokens: AgentTokens): number {
  return (
    tokens.input * tokenWeights.input +
    tokens.cacheRead * tokenWeights.cacheRead +
    tokens.cacheWrite5m * tokenWeights.cacheWrite5m +
    tokens.cacheWrite1h * tokenWeights.cacheWrite1h +
    tokens.output * tokenWeights.output
  );
}

function weigh(entries: readonly AgentModelUsage[]): number {
  return entries.reduce((sum, { tokens }) => sum + weighTokens(tokens), 0);
}

function price(facts: ModelFacts, entries: readonly AgentModelUsage[]): Price {
  return entries.reduce<Price>(
    ({ cost, unpriced }, { model, tier, tokens }) => {
      const prices = findModelFact(facts, model)?.tiers.find(({ name }) => {
        return name === tier;
      })?.prices;

      return prices === undefined
        ? {
            cost,
            unpriced: unpriced.includes(model)
              ? unpriced
              : [...unpriced, model],
          }
        : { cost: cost + priceTokens(prices, tokens), unpriced };
    },
    { cost: 0, unpriced: [] },
  );
}

function sumTokens(
  entries: readonly AgentModelUsage[],
  read: (tokens: AgentTokens) => number,
): number {
  return entries.reduce((sum, { tokens }) => sum + read(tokens), 0);
}

function formatCost({ cost, unpriced }: Price): string {
  return unpriced.length > 0 ? "?" : `$${cost.toFixed(2)}`;
}

function formatShare(part: number, total: number): string {
  return total === 0 ? "0%" : `${round((part / total) * 100)}%`;
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

function formatAgent(run: AgentRun): string {
  return run.agent === mainAgent ? mainAgent : run.agent.slice(0, 8);
}

function formatResultsByFamily(runs: readonly AgentRun[]): string {
  const families = new Map<string, AgentResultTotals>();

  for (const [family, { count, chars }] of runs.flatMap((run) => {
    return Object.entries(run.results ?? {});
  })) {
    const previous = families.get(family) ?? { count: 0, chars: 0 };

    families.set(family, {
      count: previous.count + count,
      chars: previous.chars + chars,
    });
  }

  const total = [...families.values()].reduce((sum, { chars }) => {
    return sum + chars;
  }, 0);

  const rows = [...families]
    .toSorted(([, left], [, right]) => right.chars - left.chars)
    .map(([family, { count, chars }]) => {
      return [
        family,
        String(count),
        formatCount(chars),
        formatShare(chars, total),
      ];
    });

  return formatTable(["Family", "Results", "Characters", "Share"], rows);
}

function formatLargestResults(runs: readonly AgentRun[]): string {
  const rows = runs
    .flatMap((run) => {
      return (run.largestResults ?? []).map((result) => {
        return { run, result };
      });
    })
    .toSorted((left, right) => right.result.chars - left.result.chars)
    .slice(0, largestResultCount)
    .map(({ run, result }) => {
      return [formatAgent(run), result.family, formatCount(result.chars)];
    });

  return formatTable(["Agent", "Family", "Characters"], rows);
}

export function formatAgentRuns(
  runs: readonly AgentRun[],
  facts: ModelFacts,
): string {
  const entries = runs.flatMap((run) => run.models);

  const total = weigh(entries);

  const totalPrice = price(facts, entries);

  const roles = Map.groupBy(runs, (run) => run.role);

  const byRole = [...roles].map(([role, members]) => {
    const memberEntries = members.flatMap((run) => run.models);

    const units = weigh(memberEntries);

    return [
      role,
      String(members.length),
      String(members.reduce((sum, run) => sum + run.turns, 0)),
      formatCount(sumTokens(memberEntries, (tokens) => tokens.cacheRead)),
      formatCount(
        sumTokens(memberEntries, (tokens) => {
          return tokens.cacheWrite5m + tokens.cacheWrite1h;
        }),
      ),
      formatCount(sumTokens(memberEntries, (tokens) => tokens.output)),
      formatCount(units),
      formatCost(price(facts, memberEntries)),
      formatShare(units, total),
    ];
  });

  const byAgent = runs
    .toSorted((left, right) => {
      return (left.started ?? "").localeCompare(right.started ?? "");
    })
    .map((run) => {
      return [
        formatAgent(run),
        run.role,
        run.issue ?? "",
        [...new Set(run.models.map(({ model }) => model))].join(", "),
        String(run.turns),
        formatCount(run.startContext),
        formatCount(run.peakContext),
        String(run.stops),
        formatShare(
          run.thinking ?? 0,
          sumTokens(run.models, (tokens) => tokens.output),
        ),
        String(run.batched ?? 0),
        `${run.ttl5m?.count ?? 0} (${formatCount(run.ttl5m?.tokens ?? 0)})`,
        formatCount(weigh(run.models)),
        formatCost(price(facts, run.models)),
        formatMinutes(run),
      ];
    });

  const models = Map.groupBy(entries, ({ model }) => model);

  const byModel = [...models].map(([model, modelEntries]) => {
    const modelPrice = price(facts, modelEntries);

    return [
      model,
      String(
        runs.filter((run) => {
          return run.models.some((entry) => entry.model === model);
        }).length,
      ),
      String(modelEntries.reduce((sum, entry) => sum + entry.calls, 0)),
      formatCount(weigh(modelEntries)),
      formatCost(modelPrice),
      modelPrice.unpriced.length > 0
        ? "?"
        : formatShare(modelPrice.cost, totalPrice.cost),
    ];
  });

  const unpricedNote = totalPrice.unpriced.length > 0
    ? ` Unpriced models, left out of the cost: ${totalPrice.unpriced.join(", ")}.`
    : "";

  return [
    `Units weigh input ${tokenWeights.input}, cache read ${tokenWeights.cacheRead}, 5-minute cache write ${tokenWeights.cacheWrite5m}, 1-hour cache write ${tokenWeights.cacheWrite1h}, output ${tokenWeights.output}. Total: ${formatCount(total)} units. Cost in dollars at API prices: $${totalPrice.cost.toFixed(2)}.${unpricedNote}`,
    formatTable(
      [
        "Role",
        "Runs",
        "Turns",
        "Cache read",
        "Cache write",
        "Output",
        "Units",
        "Cost",
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
        "Thinking",
        "Batched",
        "5m misses",
        "Units",
        "Cost",
        "Minutes",
      ],
      byAgent,
    ),
    formatTable(
      ["Model", "Runs", "Calls", "Units", "Cost", "Share of cost"],
      byModel,
    ),
    formatResultsByFamily(runs),
    formatLargestResults(runs),
  ].join("\n\n");
}
