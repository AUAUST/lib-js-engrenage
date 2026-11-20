import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import {
  createRolePreset,
  getIndexFile,
  resolveRoles,
  type Role,
  type RoleEffects,
} from "#batiment/roles/index";
import { adapters, constants, hooks, index, utils } from "#project/roles/index";

function resolve({
  roles,
  effects = {},
  scopes,
  published = true,
}: {
  roles: readonly Role[];
  effects?: Partial<RoleEffects>;
  scopes?: readonly string[];
  published?: boolean;
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
    published,
    ...(scopes === undefined ? {} : { scopes }),
  });
}

describe("resolveRoles", () => {
  test("defaults a role's surface from the published trait", () => {
    const app = resolve({ roles: [index(), utils()], published: false });

    expect(app.roles.utils).toMatchObject({ surface: "modules", public: true });
    expect(app.roles.index).toMatchObject({ surface: "barrel" });

    expect(resolve({ roles: [utils()] }).roles.utils).toMatchObject({
      surface: "barrel",
      public: false,
    });

    expect(
      resolve({ roles: [utils({ surface: "modules" })] }).roles.utils,
    ).toMatchObject({ surface: "modules" });

    expect(() => {
      return resolve({ roles: [utils({ surface: "modules", index: true })] });
    }).toThrow("`surface`");

    expect(() => {
      return resolve({ roles: [utils({ surface: "modules", public: false })] });
    }).toThrow("`surface`");
  });

  test("resolves only the listed roles, in their order", () => {
    const resolved = resolve({
      roles: [index(), constants(), utils({ nesting: "any" })],
    });

    expect(keys(resolved.roles)).toEqual(["index", "constants", "utils"]);

    expect(resolved.roles.utils).toMatchObject({
      nesting: "any",
      exports: { values: "named-match", types: "named" },
      effects: "confined",
    });

    expect(resolve({ roles: [] }).roles).toEqual({});
  });

  test("activates an opt-in role only where a scope enables it", () => {
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
    ).toMatchObject({ nesting: 2, optIn: true });
  });

  test("fails on two roles of one list named alike, naming both", () => {
    expect(() => resolve({ roles: [utils(), constants(), utils()] })).toThrow(
      "src.roles[0] and src.roles[2] are both named utils",
    );

    const nested = createRolePreset({ name: "nested" });

    expect(() => {
      return resolve({
        roles: [utils({ roles: [nested(), nested()] })],
      });
    }).toThrow(
      "src.roles[0].roles[0] and src.roles[0].roles[1] are both named nested",
    );
  });

  test("reads the aliases of each active role and rejects one read as two roles", () => {
    expect(
      resolve({ roles: [utils({ aliases: ["helpers"] })] }).aliases,
    ).toEqual({ helpers: "utils" });

    expect(() => {
      return resolve({
        roles: [
          utils({ aliases: ["helpers"] }),
          constants({ aliases: ["helpers"] }),
        ],
      });
    }).toThrow("helpers");
  });

  test("reads the index file name from the index role", () => {
    expect(
      getIndexFile(resolve({ roles: [index({ file: ["main.ts"] })] })),
    ).toBe("main.ts");

    expect(getIndexFile(resolve({ roles: [] }))).toBe("index.ts");
  });

  test("ranks roles against the effect levels", () => {
    const resolved = resolve({
      roles: [utils({ effects: "logging" }), adapters()],
      effects: {
        levels: ["pure", "logging", "confined", "observing", "effectful"],
      },
    });

    expect(resolved.roles.utils).toMatchObject({
      effects: "logging",
    });

    expect(resolved.roles.adapters).toMatchObject({
      effects: "effectful",
    });

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

    for (const entry of [
      {
        default: "shaky",
        symbols: { read: "pure" },
      },
      {
        default: "pure",
        symbols: { read: "shaky" },
      },
    ]) {
      expect(() => {
        return resolve({
          roles: [],
          effects: {
            modules: { custom: entry },
          },
        });
      }).toThrow("shaky");
    }
  });
});
