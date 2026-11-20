import type { ImportCycle } from "#batiment/structure/types/ImportCycle";

export function renderImportCycle(cycle: ImportCycle): string {
  return cycle.join(" -> ");
}
