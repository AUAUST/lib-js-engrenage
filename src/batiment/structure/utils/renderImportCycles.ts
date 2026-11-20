import { iterable } from "@auaust/toolkit";

import { renderImportCycle } from "#batiment/structure/utils/renderImportCycle";
import type { ImportCycle } from "#batiment/structure/types/ImportCycle";

export function renderImportCycles(cycles: readonly ImportCycle[]): string[] {
  return [
    `import cycles (${cycles.length})`,
    ...iterable.map(cycles, (cycle) => `  ${renderImportCycle(cycle)}`),
  ];
}
