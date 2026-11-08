import { freeze } from "@auaust/toolkit/object";

// @debt structure finds the index and entry roles by these names, while a preset's `name` option lets a project rename them
export const indexRoleName = "index";

export const entryRoleName = "entrypoint";

export const executableRoleName = "executable";

export const roleContractDefaults = freeze({
  nesting: 0,
  index: false,
  public: false,
  typeOnly: false,
  discovered: false,
  scoped: false,
  strict: false,
  unique: false,
  required: false,
} as const);
