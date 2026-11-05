import { freeze } from "@auaust/toolkit/object";

import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleContract } from "#project/structure/types/RoleContract";
import type { RoleEffects } from "#project/structure/types/RoleEffects";
import type { RoleKey } from "#project/structure/types/RoleKey";

export const roleCatalogue = {
  "index": { purpose: "The domain's public surface.", file: ["index.ts"] },
  "entry": {
    purpose:
      "The package entry of a public domain, re-exporting the public subset of its surface.",
    file: ["entry.ts"],
  },
  "constants": {
    purpose: "Deeply read-only constants of the domain.",
    file: ["constants.ts"],
    effects: "pure",
    public: true,
  },
  "declarations": {
    purpose: "Ambient type declarations.",
    file: ["*.d.ts"],
  },
  "types": {
    purpose: "Types only, one per module.",
    exports: "named-match",
    typeOnly: true,
  },
  "utils": {
    purpose: "Confined functions, one per module.",
    exports: "named-match",
    effects: "confined",
  },
  "errors": {
    purpose: "Error classes, importable module by module.",
    exports: "named-match",
    effects: "pure",
    public: true,
  },
  "enums": {
    purpose: "Enumerations, one per module.",
    exports: "named-match",
    effects: "pure",
  },
  "ports": {
    purpose: "Interfaces other domains implement, importable module by module.",
    exports: "named-match",
    public: true,
    typeOnly: true,
    effects: "pure",
  },
  "adapters": {
    purpose:
      "Implementations of other domains' ports, importable module by module.",
    exports: "named-match",
    public: true,
  },
  "fixtures": {
    purpose: "Static test inputs.",
    nesting: "any",
    effects: "pure",
  },
  "setup.ts": {
    purpose: "Test runner setup file.",
    file: ["setup.ts"],
    discovered: true,
  },
  "schemas": {
    purpose: "Validation schemas of options.",
    exports: "named-match",
    effects: "pure",
  },
  "components": {
    purpose: "UI components with their styles.",
    accepts: ["*.tsx", "*.css"],
    exports: "named-match",
    scoped: true,
  },
  "hooks": {
    purpose: "Reusable stateful logic of components.",
    exports: "named-match",
    scoped: true,
  },
  "contexts": {
    purpose: "Shared state providers.",
    exports: "named-match",
    scoped: true,
  },
  "pages": {
    purpose: "Routable pages, discovered by the router.",
    discovered: true,
    exports: "default",
    nesting: "any",
  },
  "styles": { purpose: "Stylesheets.", accepts: ["*.css"] },
} as const satisfies Record<string, RoleContract>;

export const roleContractDefaults = freeze({
  nesting: 0,
  index: false,
  public: false,
  typeOnly: false,
  discovered: false,
  scoped: false,
} as const satisfies Partial<ResolvedRoleContract>);

export const defaultRoleKeys = [
  "index",
  "constants",
  "declarations",
  "types",
  "utils",
  "errors",
  "enums",
  "ports",
  "adapters",
] as const satisfies readonly RoleKey[];

export const testsRoleKeys = [
  "fixtures",
  "setup.ts",
] as const satisfies readonly RoleKey[];

export const publishedRoleKeys = {
  src: ["entry"],
} as const satisfies Partial<Record<string, readonly RoleKey[]>>;

export const environmentRoleKeys = {
  src: defaultRoleKeys,
  tests: [...defaultRoleKeys, ...testsRoleKeys],
  scripts: defaultRoleKeys,
  tooling: defaultRoleKeys,
} as const satisfies Record<string, readonly RoleKey[]>;

export const indexRole = "index" satisfies RoleKey;

export const defaultIndexFile = "index.ts";

export const entryRole = "entry" satisfies RoleKey;

export const testsSetupRole = "setup.ts" satisfies RoleKey;

export const defaultEffectLevels = freeze([
  "pure",
  "confined",
  "effectful",
] as const);

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

export const noRoleEffects = freeze({
  levels: undefined,
  modules: undefined,
  fallback: undefined,
} as const satisfies RoleEffects);

export const noRoles: ResolvedRoles = freeze({
  roles: freeze({}),
  aliases: freeze({}),
  effects: freeze({
    levels: defaultEffectLevels,
    modules: freeze([]),
    fallback: undefined,
  }),
});
