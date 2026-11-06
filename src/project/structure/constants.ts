import { freeze } from "@auaust/toolkit/object";

import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";

// @debt the index and entry roles are found by these fixed names, while a project builds its roles from presets that let it rename them
export const indexRole = "index";

export const defaultIndexFile = "index.ts";

export const entryRole = "entry";

export const defaultEffectLevels = freeze([
  "pure",
  "confined",
  "effectful",
] as const);

// @debt a hand-picked list: any other external module (`node:module`, `c12`, `yaml`) is unranked and importable from a pure role, so effect levels measure only these imports
export const effectfulModules = freeze([
  "node:fs",
  "node:fs/promises",
  "node:child_process",
  "node:process",
  "node:os",
  "node:net",
  "node:http",
  "node:https",
  "node:worker_threads",
] as const);

export const noRoles: ResolvedRoles = freeze({
  roles: freeze({}),
  aliases: freeze({}),
  effects: freeze({
    levels: defaultEffectLevels,
    modules: freeze([]),
    fallback: undefined,
  }),
});
