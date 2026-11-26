import { filter, flatMap, map } from "@auaust/toolkit/array";
import { max, round } from "@auaust/toolkit/math";

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

/**
 * Lists each group of steps that ran with its duration, its steps indented below
 * it, then the run's total, or nothing when no step ran.
 */
export function formatGateTimings({
  groups,
  duration,
}: GateTimings): string | undefined {
  const ran = filter(groups, ({ steps }) => steps.length > 0);

  if (ran.length === 0) {
    return;
  }

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
