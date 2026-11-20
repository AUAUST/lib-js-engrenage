import type { StructureDiagnostic } from "#project/structure/types/StructureDiagnostic";
import type { StructureDiagnosticCode } from "#project/structure/types/StructureDiagnosticCode";

const separators = {
  "unclassified": "  ",
  "cardinality": "  ",
  "twin": "  ",
  "unreached": "  ",
  "missing-purpose": " ",
  "import-cycle": "  ",
} as const satisfies Record<StructureDiagnosticCode, string>;

export function renderStructureDiagnostic({
  code,
  path,
  message,
}: StructureDiagnostic): string {
  return path === undefined ? message : `${path}${separators[code]}${message}`;
}
