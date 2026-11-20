import type { ImportCycle } from "#project/structure/types/ImportCycle";

export function renderImportCycle(cycle: ImportCycle): string {
  return cycle.join(" -> ");
}
