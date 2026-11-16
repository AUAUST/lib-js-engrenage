import { map as mapIterable } from "@auaust/toolkit/iterable";

import type { ImportCycle } from "#project/structure/types/ImportCycle";

export function renderImportCycles(cycles: readonly ImportCycle[]): string[] {
  return [
    `import cycles (${cycles.length})`,
    ...mapIterable(cycles, (cycle) => `  ${cycle.join(" -> ")}`),
  ];
}
