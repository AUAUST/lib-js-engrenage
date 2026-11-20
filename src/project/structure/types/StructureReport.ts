import type { ImportCycle } from "#project/structure/types/ImportCycle";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { StructureDiagnostic } from "#project/structure/types/StructureDiagnostic";

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
