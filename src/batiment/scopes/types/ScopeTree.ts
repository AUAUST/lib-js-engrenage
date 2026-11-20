import type { StructureDiagnostic } from "#batiment/report/index";
import type { Scope } from "#batiment/scopes/types/Scope";

export interface ScopeTree {
  readonly scopes: Readonly<Record<string, Scope>>;
  readonly diagnostics: readonly StructureDiagnostic[];
}
