import { freeze } from "@auaust/toolkit/object";
import type { DeepReadonly } from "@auaust/toolkit/types";

import type { ReexportMode } from "#project/roles/index";
import type { ImportCategory } from "#project/structure/types/ImportCategory";
import type { ImportRelation } from "#project/structure/types/ImportRelation";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";

export const defaultIndexFile = "index.ts";

export const namespaceMetadataFile = ".namespace.json";

export const domainMetadataFile = ".domain.json";

export const defaultReexport = "namespace" satisfies ReexportMode;

export const sourceEnvironment = "src";

export const dataEnvironment = "data";

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

export const importRelations = freeze({
  "own-roles": "its own roles and files, excluding its index and entry",
  "global-roles": "the global roles of the environment root",
  "ancestor-roles": "the roles of its ancestor domains, as a sub-domain",
  "sub-domain": "the target's `index.ts` and public roles, through its nearest sub-domain's surface",
  "lower-layer": "the target's `index.ts` and public roles, through a domain in a lower layer",
  "peer": "the target's `index.ts` and public roles, through a peer domain (same layer, unless isolated)",
  "root-entry": "any public surface, from the environment root file",
  "workspace": "another workspace, only through a declared dependency",
} as const satisfies Record<ImportRelation, string>);

export const importCategories = freeze({
  "public-entries": "the package name and its subpaths",
  "internal-aliases": "`#…` aliases into `src`",
  "dist-artefacts": "the build output",
} as const satisfies Record<ImportCategory, string>);

export const projectMapRule = "project-map";
