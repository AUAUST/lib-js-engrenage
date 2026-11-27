import { filter, map } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import { formatDuration } from "#nexus/reports/index";
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

/**
 * The run's total on one line, followed by the duration of each stage group that
 * ran unless an earlier run was `reused`.
 */
export function formatGateTimings(
  { groups, duration }: GateTimings,
  { reused = false }: { reused?: boolean } = {},
): string {
  const ran = filter(groups, ({ steps }) => steps.length > 0);

  return formatSummary(ran, duration, reused);
}
