/**
 * What a structure diagnostic reports: an unclassified directory under `strict`,
 * a role cardinality violation, a module beside the command group of its name, a
 * declaration the walk never reaches, a domain without purpose or an import cycle.
 *
 * @experimental
 */
export type StructureDiagnosticCode =
  | "unclassified"
  | "cardinality"
  | "twin"
  | "unreached"
  | "missing-purpose"
  | "import-cycle";
