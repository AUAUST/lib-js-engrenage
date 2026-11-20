import { freeze } from "@auaust/toolkit/object";

// @debt structure finds the index and entry roles by these names, while a preset's `name` option lets a project rename them
export const indexRoleName = "index";

export const entryRoleName = "entrypoint";

export const executableRoleName = "executable";

export const reexportModes = freeze(["namespace", "flat"] as const);

export const roleExportStyles = freeze([
  "named-match",
  "named",
  "default",
] as const);

export const roleValueExportStyles = freeze([
  ...roleExportStyles,
  "none",
] as const);

export const roleTypeExportStyles = freeze([
  "named-match",
  "named",
  "none",
] as const);

export const roleSurfaces = freeze(["barrel", "modules"] as const);

export const roleContractDefaults = freeze({
  nesting: 0,
  index: false,
  public: false,
  collected: false,
  typeOnly: false,
  discovered: false,
  scoped: false,
  strict: false,
  unique: false,
  required: false,
  subpath: false,
} as const);
