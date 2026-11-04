import { map } from "@auaust/primitive-kit/arrays";

import type { ImportCycle } from "#project/structure/types/ImportCycle";

export function renderImportCycles(cycles: readonly ImportCycle[]): string[] {
  return [
    `import cycles (${cycles.length})`,
    ...map(cycles, (cycle) => `  ${cycle.join(" -> ")}`),
  ];
}
