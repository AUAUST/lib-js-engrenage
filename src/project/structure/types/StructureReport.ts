import type { StructureDiagnostic } from "#batiment/report/index";
import type { ResolvedStructure } from "#batiment/structure/index";
import type { ImportCycle } from "#project/structure/types/ImportCycle";

/**
 * The structure check's result: the facts it read, the resolved structure and
 * the runtime import cycles, and the diagnostics it found in them.
 *
 * @experimental
 */
export interface StructureReport {
  readonly facts: {
    readonly structure: ResolvedStructure;
    readonly cycles: readonly ImportCycle[];
  };
  readonly diagnostics: readonly StructureDiagnostic[];
}
