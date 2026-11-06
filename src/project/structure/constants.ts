import { freeze } from "@auaust/toolkit/object";
import type { DeepReadonly } from "@auaust/toolkit/types";

import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";

export const defaultIndexFile = "index.ts";

export const elementEnvironments = freeze([
  "src",
  "scripts",
  "tooling",
] as const);

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

export const noRoles = freeze({
  roles: freeze({}),
  aliases: freeze({}),
  effects: freeze({
    levels: defaultEffectLevels,
    modules: freeze([]),
    fallback: undefined,
  }),
}) satisfies DeepReadonly<ResolvedRoles>;
