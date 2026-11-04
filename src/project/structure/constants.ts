import { freeze } from "@auaust/toolkit/object";

import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";
import type { RoleContract } from "#project/structure/types/RoleContract";
import type { RoleKey } from "#project/structure/types/RoleKey";

export const roleCatalogue = {
  "index.ts": { purpose: "The domain's public surface.", file: ["index.ts"] },
  "constants": {
    purpose: "Deeply read-only constants of the domain.",
    file: ["constants.ts"],
  },
  "declarations": {
    purpose: "Ambient type declarations.",
    file: ["*.d.ts"],
  },
  "types": { purpose: "Types only, one per module.", exports: "named-match" },
  "utils": {
    purpose: "Pure functions, one per module.",
    exports: "named-match",
  },
  "errors": {
    purpose: "Error classes, importable module by module.",
    exports: "named-match",
    public: true,
  },
  "enums": { purpose: "Enumerations, one per module.", exports: "named-match" },
  "ports": {
    purpose: "Interfaces other domains implement, importable module by module.",
    exports: "named-match",
    public: true,
  },
  "adapters": {
    purpose:
      "Implementations of other domains' ports, importable module by module.",
    exports: "named-match",
    public: true,
  },
  "fixtures": { purpose: "Static test inputs.", nesting: "any" },
  "setup.ts": {
    purpose: "Test runner setup file.",
    file: ["setup.ts"],
    discovered: true,
  },
  "schemas": {
    purpose: "Validation schemas of options.",
    exports: "named-match",
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

export const defaultRoleKeys = [
  "index.ts",
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

export const environmentRoleKeys = {
  src: defaultRoleKeys,
  tests: [...defaultRoleKeys, ...testsRoleKeys],
  scripts: defaultRoleKeys,
  tooling: defaultRoleKeys,
} as const satisfies Record<string, readonly RoleKey[]>;

export const testsSetupRole = "setup.ts" satisfies RoleKey;

export const noRoles: ResolvedRoles = freeze({
  roles: freeze({}),
  aliases: freeze({}),
});
