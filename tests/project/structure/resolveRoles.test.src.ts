import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { resolveRoles } from "#project/structure/utils/resolveRoles";

describe("resolveRoles", () => {
  test("resolves the defaults of an environment, tests adding its own", () => {
    const source = resolveRoles({ environment: "src", roles: undefined });
    const tests = resolveRoles({ environment: "tests", roles: undefined });

    expect(keys(source.roles)).toEqual([
      "index.ts",
      "constants.ts",
      "*.d.ts",
      "types",
      "utils",
      "errors",
      "enums",
      "ports",
      "adapters",
    ]);

    expect(keys(tests.roles)).toEqual(
      expect.arrayContaining(["utils", "fixtures", "setup.ts"]),
    );

    expect(source.roles).not.toHaveProperty("schemas");
    expect(source.roles).not.toHaveProperty("fixtures");
    expect(source.roles.errors).toMatchObject({ public: true });
  });

  test("applies the top level, then the environment, with define last", () => {
    const roles = { disable: ["enums" as const], enable: ["schemas" as const] };

    expect(
      resolveRoles({ environment: "src", roles }).roles,
    ).not.toHaveProperty("enums");

    expect(resolveRoles({ environment: "src", roles }).roles).toHaveProperty(
      "schemas",
    );

    const tests = resolveRoles({
      environment: "tests",
      roles,
      environmentRoles: { enable: ["enums"] },
    });

    expect(tests.roles).toHaveProperty("enums");

    expect(
      resolveRoles({
        environment: "scripts",
        roles: {
          define: {
            utils: { exports: "default" },
          },
        },
      }).roles.utils,
    ).toEqual({ exports: "default" });
  });

  test("yields no role in any environment when the role system is off", () => {
    for (const environment of ["src", "tests", "scripts", "tooling"] as const) {
      expect(resolveRoles({ environment, roles: false })).toEqual({
        roles: {},
        aliases: {},
      });
    }
  });

  test("activates a scoped role only where a scope enables it", () => {
    const roles = {
      define: {
        gql: { roles: ["queries"] },
        queries: { scoped: true },
      },
    };

    const elsewhere = resolveRoles({ environment: "src", roles });

    const inside = resolveRoles({
      environment: "src",
      roles,
      scopes: ["queries"],
    });

    expect(elsewhere.roles).toHaveProperty("gql");
    expect(elsewhere.roles).not.toHaveProperty("queries");
    expect(inside.roles).toHaveProperty("queries");

    expect(
      resolveRoles({
        environment: "src",
        roles: undefined,
        scopes: ["hooks"],
      }).roles,
    ).toHaveProperty("hooks");

    expect(
      resolveRoles({ environment: "src", roles: undefined }).roles,
    ).not.toHaveProperty("hooks");
  });

  test("reads an alias as an active role and rejects any other target", () => {
    expect(
      resolveRoles({
        environment: "src",
        roles: {
          aliases: { helpers: "utils" },
        },
      }).aliases,
    ).toEqual({ helpers: "utils" });

    expect(() =>
      resolveRoles({
        environment: "src",
        roles: {
          aliases: { helpers: "unknown" },
        },
      }),
    ).toThrow("not an active role");
  });
});
