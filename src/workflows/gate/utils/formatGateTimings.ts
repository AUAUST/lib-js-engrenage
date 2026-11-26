import { filter, flatMap, map } from "@auaust/toolkit/array";
import { max, round } from "@auaust/toolkit/math";
import { values } from "@auaust/toolkit/object";

import { gateBookkeepingGroups } from "#workflows/gate/constants";
import type { GateGroupTiming } from "#workflows/gate/types/GateGroupTiming";
import type { GateTimings } from "#workflows/gate/types/GateTimings";

interface TimingLine {
  readonly label: string;
  readonly duration: string;
}

function formatDuration(milliseconds: number): string {
  const rounded = round(milliseconds);

  return rounded < 1000
    ? `${rounded}ms`
    : `${(milliseconds / 1000).toFixed(2)}s`;
}

function formatSummary(
  ran: readonly GateGroupTiming[],
  duration: number,
  reused: boolean,
): string {
  const bookkeeping: readonly string[] = values(gateBookkeepingGroups);

  const stages = filter(ran, ({ name }) => !bookkeeping.includes(name));

  const total = `Duration ${formatDuration(duration)}`;

  if (reused || stages.length === 0) {
    return total;
  }

  const parts = map(stages, (group) => {
    return `${group.name} ${formatDuration(group.duration)}`;
  });

  return `${total} (${parts.join(", ")})`;
}

function formatDetails(
  ran: readonly GateGroupTiming[],
  duration: number,
): string {
  const lines: TimingLine[] = [
    ...flatMap(ran, (group) => {
      return [
        { label: `  ${group.name}`, duration: formatDuration(group.duration) },
        ...map(group.steps, (step) => {
          return {
            label: `    ${step.name}`,
            duration: formatDuration(step.duration),
          };
        }),
      ];
    }),
    { label: "  total", duration: formatDuration(duration) },
  ];

  const labelWidth = max(...map(lines, ({ label }) => label.length));

  const durationWidth = max(...map(lines, ({ duration: text }) => text.length));

  return [
    "Durations",
    ...map(lines, ({ label, duration: text }) => {
      return `${label.padEnd(labelWidth)}  ${text.padStart(durationWidth)}`;
    }),
  ].join("\n");
}

/**
 * The run's total on one line, followed by the duration of each stage group
 * that ran unless an earlier run was `reused`; when `detailed`, instead lists
 * every group that ran with its steps indented below it, then the total, or
 * nothing when no step ran.
 */
export function formatGateTimings(
  { groups, duration }: GateTimings,
  {
    detailed = false,
    reused = false,
  }: { detailed?: boolean; reused?: boolean } = {},
): string | undefined {
  const ran = filter(groups, ({ steps }) => steps.length > 0);

  if (!detailed) {
    return formatSummary(ran, duration, reused);
  }

  if (ran.length === 0) {
    return;
  }

  return formatDetails(ran, duration);
}
