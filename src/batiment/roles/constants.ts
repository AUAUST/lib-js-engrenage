import { freeze } from "@auaust/toolkit/object";
import type { DeepReadonly } from "@auaust/toolkit/types";

import type { ResolvedRoles } from "#batiment/roles/types/ResolvedRoles";

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

// @debt a TypeScript file name hardcoded in the language-agnostic structure model; belongs to a language port
export const defaultIndexFile = "index.ts";

export const defaultEffectLevels = freeze([
  "pure",
  "confined",
  "observing",
  "effectful",
] as const);

export const effectLevelPurposes = freeze({
  pure: "Compute from arguments only, without observable changes.",
  confined: "Mutate caller-owned values or maintain a private memo cache.",
  observing: "Read the context or write diagnostics without changing state later operations read.",
  effectful: "Change state later operations can read, including staged writes and spawned processes.",
}) satisfies Readonly<Record<(typeof defaultEffectLevels)[number], string>>;

export const noRoles = freeze({
  roles: freeze({}),
  aliases: freeze({}),
  effects: freeze({
    levels: defaultEffectLevels,
    modules: freeze([]),
    fallback: undefined,
  }),
}) satisfies DeepReadonly<ResolvedRoles>;
