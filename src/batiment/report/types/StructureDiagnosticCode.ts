/**
 * What a structure diagnostic reports: an unclassified directory under `strict`,
 * a role cardinality violation, a module beside the command group of its name, a
 * declaration the walk never reaches, a domain without purpose, an import cycle,
 * or a walk finding: a metafile unreadable, invalid, misplaced or conflicting
 * with another metafile or the config, a private domain holding an entry, a
 * collected role that is not public, two files sharing one specifier, or a root
 * directory a static layout does not list or a required one it lacks; or a scope
 * tree finding: a workspace inside a root environment's directory, a workspace
 * key equal to a root environment name, a workspace inside another, a directory a
 * `workspaces` glob matches without a `.workspace.json`, an `.environment.json`
 * outside a scope's direct child directory, a top-level namespace taking a
 * kind no `namespaceKinds` entry names, or an `.environment.json` language no
 * `languages` entry names.
 *
 * @experimental
 */
export type StructureDiagnosticCode =
  | "unclassified"
  | "cardinality"
  | "twin"
  | "unreached"
  | "missing-purpose"
  | "import-cycle"
  | "unreadable-metafile"
  | "invalid-metafile"
  | "metafile-kind-conflict"
  | "metafile-field-conflict"
  | "shared-metafile-directory"
  | "domain-metafile-at-root"
  | "mirrored-metafile"
  | "config-metafile-conflict"
  | "config-metafile-kind"
  | "domain-glob-namespace"
  | "children-domains-namespace"
  | "private-domain-entry"
  | "collected-role-not-public"
  | "shared-specifier"
  | "unlisted-layout-entry"
  | "missing-layout-entry"
  | "workspace-in-namespace"
  | "workspace-namespace-name"
  | "nested-workspace"
  | "missing-workspace"
  | "misplaced-environment-metafile"
  | "unknown-namespace-kind"
  | "unknown-language";
