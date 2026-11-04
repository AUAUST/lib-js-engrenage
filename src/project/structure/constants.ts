import { freeze } from "@auaust/toolkit/object";

import type { ResolvedRoles } from "#structure/types/ResolvedRoles";
import type { RoleContract } from "#structure/types/RoleContract";
import type { RoleKey } from "#structure/types/RoleKey";

export const roleCatalogue = {
  "index.ts": { file: ["index.ts"] },
  "constants.ts": { file: ["constants.ts"] },
  "*.d.ts": { file: ["*.d.ts"] },
  "types": { exports: "named-match" },
  "utils": { exports: "named-match" },
  "errors": { exports: "named-match", public: true },
  "enums": { exports: "named-match" },
  "ports": { exports: "named-match", public: true },
  "adapters": { exports: "named-match", public: true },
  "fixtures": { nesting: "any" },
  "setup.ts": { file: ["setup.ts"], discovered: true },
  "schemas": { exports: "named-match" },
  "components": {
    accepts: ["*.tsx", "*.css"],
    exports: "named-match",
    scoped: true,
  },
  "hooks": { exports: "named-match", scoped: true },
  "contexts": { exports: "named-match", scoped: true },
  "pages": {
    discovered: true,
    exports: "default",
    nesting: "any",
  },
  "styles": { accepts: ["*.css"] },
} as const satisfies Record<string, RoleContract>;

export const defaultRoleKeys = [
  "index.ts",
  "constants.ts",
  "*.d.ts",
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
