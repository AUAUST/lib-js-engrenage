import { freeze } from "@auaust/toolkit/object";

import type { ReexportMode } from "#batiment/roles/index";
import type { ImportCategory } from "#batiment/structure/types/ImportCategory";
import type { ImportRelation } from "#batiment/structure/types/ImportRelation";

export const namespaceMetadataFile = ".namespace.json";

export const domainMetadataFile = ".domain.json";

export const defaultReexport = "namespace" satisfies ReexportMode;

export const sourceEnvironment = "src";

export const dataEnvironment = "data";

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
