import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { resolveEffects, type EffectLevel } from "#batiment/effects/index";
import {
  createRolePreset,
  getIndexFile,
  resolveRoles,
  type Role,
} from "#batiment/roles/index";
import {
  adapters,
  constants,
  hooks,
  index,
  types,
  utils,
} from "#project/roles/index";

function resolve({
  roles,
  levels,
  scopes,
  published = true,
  typeImports = true,
}: {
  roles: readonly Role[];
  levels?: readonly EffectLevel[];
  scopes?: readonly string[];
  published?: boolean;
  typeImports?: boolean;
}) {
  return resolveRoles({
    namespace: "src",
    roles,
    effects: resolveEffects({ levels }),
    typeImports,
    published,
    ...(scopes === undefined ? {} : { scopes }),
  });
}

describe("resolveRoles", () => {
  test("defaults a public role's surface from the published trait", () => {
    const app = resolve({
      roles: [index(), utils(), utils({ name: "shared", public: true })],
      published: false,
    });

    expect(app.roles.utils).toMatchObject({ surface: "barrel", public: false });

    expect(app.roles.shared).toMatchObject({
      surface: "modules",
      public: true,
    });

    expect(app.roles.index).toMatchObject({ surface: "barrel" });

    expect(
      resolve({ roles: [utils({ public: true })] }).roles.utils,
    ).toMatchObject({ surface: "barrel", public: true });

    expect(
      resolve({ roles: [utils({ surface: "modules", public: true })] }).roles
        .utils,
    ).toMatchObject({ surface: "modules" });

    expect(() => {
      return resolve({
        roles: [
          utils({
            surface: "modules",
            public: true,
            index: true,
          }),
        ],
      });
    }).toThrow("`surface`");
  });

  test("refuses a surface on a role resolving non-public", () => {
    for (const published of [true, false]) {
      expect(() => {
        return resolve({ roles: [utils({ surface: "modules" })], published });
      }).toThrow(/`surface`.*`public`/);
    }
  });

  test("resolves only the listed roles, in their order", () => {
    const resolved = resolve({
      roles: [index(), constants(), utils({ nesting: "any" })],
    });

    expect(keys(resolved.roles)).toEqual(["index", "constants", "utils"]);

    expect(resolved.roles.utils).toMatchObject({
      nesting: "any",
      exports: { values: "named-match", types: "named" },
      effects: { evaluation: "confined", invocation: "confined" },
    });

    expect(resolve({ roles: [] }).roles).toEqual({});
  });

  test("resolves a typeOnly role as not type-only without type imports", () => {
    expect(resolve({ roles: [types()] }).roles.types).toMatchObject({
      typeOnly: true,
    });

    expect(
      resolve({ roles: [types()], typeImports: false }).roles.types,
    ).toMatchObject({ typeOnly: false });
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
      levels: [
        "pure",
        { name: "logging", purpose: "Write logs." },
        "printing",
        "confined",
        "observing",
        "effectful",
      ],
    });

    expect(resolved.roles.utils).toMatchObject({
      effects: { evaluation: "logging", invocation: "logging" },
    });

    expect(resolved.roles.adapters).toMatchObject({
      effects: { evaluation: "confined", invocation: "effectful" },
    });

    expect(resolved.effects.levels).toContain("logging");
  });

  test("fails on an unknown level", () => {
    expect(() => {
      resolve({ roles: [utils({ effects: "shaky" })] });
    }).toThrow("shaky");

    expect(() => {
      resolve({
        roles: [
          utils({
            effects: { evaluation: "shaky" },
          }),
        ],
      });
    }).toThrow("ranked shaky for its evaluation");
  });
});
