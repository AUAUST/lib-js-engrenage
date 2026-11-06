import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import {
  adapters,
  constants,
  createRolePreset,
  hooks,
  indexRole,
  utils,
  type Role,
} from "#project/roles/index";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import { resolveRoles } from "#project/structure/utils/resolveRoles";
import type { RoleEffects } from "#project/structure/types/RoleEffects";

function resolve({
  roles,
  effects = {},
  scopes,
}: {
  roles: readonly Role[];
  effects?: Partial<RoleEffects>;
  scopes?: readonly string[];
}) {
  return resolveRoles({
    environment: "src",
    roles,
    effects: {
      levels: undefined,
      modules: undefined,
      fallback: undefined,
      ...effects,
    },
    verbatimModuleSyntax: true,
    ...(scopes === undefined ? {} : { scopes }),
  });
}

describe("resolveRoles", () => {
  test("resolves only the listed roles, in their order", () => {
    const resolved = resolve({
      roles: [indexRole(), constants(), utils({ nesting: "any" })],
    });

    expect(keys(resolved.roles)).toEqual(["index", "constants", "utils"]);

    expect(resolved.roles.utils).toMatchObject({
      nesting: "any",
      exports: "named-match",
      effects: "confined",
    });

    expect(resolve({ roles: [] }).roles).toEqual({});
  });

  test("activates a scoped role only where a scope enables it", () => {
    expect(resolve({ roles: [hooks()] }).roles).not.toHaveProperty("hooks");

    expect(
      resolve({ roles: [hooks()], scopes: ["hooks"] }).roles,
    ).toHaveProperty("hooks");

    expect(() => resolve({ roles: [], scopes: ["hooks"] })).toThrow(
      "not defined for src",
    );
  });

  test("registers nested roles under their owner, active inside it only", () => {
    const queries = createRolePreset({ name: "queries", nesting: 2 });
    const roles = [createRolePreset({ name: "gql" })({ roles: [queries()] })];

    expect(resolve({ roles }).roles.gql).toMatchObject({
      roles: ["gql/queries"],
    });

    expect(resolve({ roles }).roles).not.toHaveProperty("gql/queries");

    expect(
      resolve({ roles, scopes: ["gql/queries"] }).roles["gql/queries"],
    ).toMatchObject({ nesting: 2, scoped: true });
  });

  test("fails on two roles of one list named alike, naming both", () => {
    expect(() => resolve({ roles: [utils(), constants(), utils()] })).toThrow(
      "src.roles[0] and src.roles[2] are both named utils",
    );

    const nested = createRolePreset({ name: "nested" });

    expect(() =>
      resolve({ roles: [utils({ roles: [nested(), nested()] })] }),
    ).toThrow(
      "src.roles[0].roles[0] and src.roles[0].roles[1] are both named nested",
    );
  });

  test("reads the aliases of each active role and rejects one read as two roles", () => {
    expect(
      resolve({ roles: [utils({ aliases: ["helpers"] })] }).aliases,
    ).toEqual({ helpers: "utils" });

    expect(() =>
      resolve({
        roles: [
          utils({ aliases: ["helpers"] }),
          constants({ aliases: ["helpers"] }),
        ],
      }),
    ).toThrow("helpers");
  });

  test("reads the index file name from the index role", () => {
    expect(
      getIndexFile(resolve({ roles: [indexRole({ file: ["main.ts"] })] })),
    ).toBe("main.ts");

    expect(getIndexFile(resolve({ roles: [] }))).toBe("index.ts");
  });

  test("ranks roles against the effect levels", () => {
    const resolved = resolve({
      roles: [utils({ effects: "logging" }), adapters()],
      effects: { levels: ["pure", "logging", "confined", "effectful"] },
    });

    expect(resolved.roles.utils).toMatchObject({ effects: "logging" });
    expect(resolved.roles.adapters).toMatchObject({ effects: undefined });
    expect(resolved.effects.levels).toContain("logging");
  });

  test("fails on an unknown level", () => {
    expect(() => {
      resolve({ roles: [utils({ effects: "shaky" })] });
    }).toThrow("shaky");

    expect(() => {
      resolve({
        roles: [],
        effects: { fallback: "shaky" },
      });
    }).toThrow("shaky");
  });
});
