import { filter, flatMap, map } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import {
  formatDuration,
  tableEntry,
  type TableEntry,
  type TableRow,
} from "#nexus/reports/index";
import { gateBookkeepingGroups } from "#workflows/gate/constants";
import type { GateGroupTiming } from "#workflows/gate/types/GateGroupTiming";
import type { GateTimings } from "#workflows/gate/types/GateTimings";

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
): TableEntry {
  const rows: TableRow[] = [
    ...flatMap(ran, (group) => {
      return [
        { cells: [group.name, formatDuration(group.duration)] },
        ...map(group.steps, (step) => {
          return {
            cells: [step.name, formatDuration(step.duration)],
            depth: 1,
          };
        }),
      ];
    }),
    { cells: ["total", formatDuration(duration)] },
  ];

  return tableEntry({
    title: "Durations",
    columns: [{ align: "start" }, { align: "end" }],
    rows,
  });
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
): string | TableEntry | undefined {
  const ran = filter(groups, ({ steps }) => steps.length > 0);

  if (!detailed) {
    return formatSummary(ran, duration, reused);
  }

  if (ran.length === 0) {
    return;
  }

  return formatDetails(ran, duration);
}
