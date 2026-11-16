import { iterable } from "@auaust/toolkit";

import type { ImportCycle } from "#project/structure/types/ImportCycle";

export function renderImportCycles(cycles: readonly ImportCycle[]): string[] {
  return [
    `import cycles (${cycles.length})`,
    ...iterable.map(cycles, (cycle) => `  ${cycle.join(" -> ")}`),
  ];
}
