import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { rolesOptionSchema } from "#project/structure/config/schemas/rolesOptionSchema";
import { rolesSchema } from "#project/structure/config/schemas/rolesSchema";
import { resolveRoles } from "#project/structure/operations/resolveRoles";
import { getIndexFile } from "#project/structure/utils/getIndexFile";
import { normalizeRoles } from "#project/structure/utils/normalizeRoles";
import type { RoleEnvironment } from "#project/structure/types/RoleEnvironment";

function resolve({
  environment,
  roles,
  environmentRoles,
  scopes,
}: {
  environment: RoleEnvironment;
  roles: unknown;
  environmentRoles?: unknown;
  scopes?: readonly string[];
}) {
  const declared = rolesSchema.resolve(roles, undefined, "roles");

  return resolveRoles({
    environment,
    roles: { ...normalizeRoles(declared), enabled: declared.enabled },
    environmentRoles: normalizeRoles(
      rolesOptionSchema.resolve(environmentRoles, undefined, "roles"),
    ),
    ...(scopes === undefined ? {} : { scopes }),
  });
}

describe("resolveRoles", () => {
  test("resolves the defaults of an environment, tests adding its own", () => {
    const source = resolve({ environment: "src", roles: undefined });
    const tests = resolve({ environment: "tests", roles: undefined });

    expect(keys(source.roles)).toEqual([
      "index",
      "constants",
      "declarations",
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

    expect(resolve({ environment: "src", roles }).roles).not.toHaveProperty(
      "enums",
    );

    expect(resolve({ environment: "src", roles }).roles).toHaveProperty(
      "schemas",
    );

    const tests = resolve({
      environment: "tests",
      roles,
      environmentRoles: { enable: ["enums"] },
    });

    expect(tests.roles).toHaveProperty("enums");

    expect(
      resolve({
        environment: "scripts",
        roles: {
          define: {
            utils: { exports: "default" },
          },
        },
      }).roles.utils,
    ).toMatchObject({ exports: "default" });
  });

  test("yields no role in any environment when the role system is off", () => {
    for (const environment of ["src", "tests", "scripts", "tooling"] as const) {
      expect(resolve({ environment, roles: false })).toEqual({
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

    const elsewhere = resolve({ environment: "src", roles });

    const inside = resolve({
      environment: "src",
      roles,
      scopes: ["queries"],
    });

    expect(elsewhere.roles).toHaveProperty("gql");
    expect(elsewhere.roles).not.toHaveProperty("queries");
    expect(inside.roles).toHaveProperty("queries");

    expect(
      resolve({
        environment: "src",
        roles: undefined,
        scopes: ["hooks"],
      }).roles,
    ).toHaveProperty("hooks");

    expect(
      resolve({ environment: "src", roles: undefined }).roles,
    ).not.toHaveProperty("hooks");
  });

  test("reads an alias as an active role and rejects any other target", () => {
    expect(
      resolve({
        environment: "src",
        roles: {
          aliases: { helpers: "utils" },
        },
      }).aliases,
    ).toEqual({ helpers: "utils" });

    expect(() =>
      resolve({
        environment: "src",
        roles: {
          aliases: { helpers: "unknown" },
        },
      }),
    ).toThrow("not an active role");
  });

  test("merges the given fields over the inherited role, replacing a whole redefinition", () => {
    const inherited = resolve({
      environment: "src",
      roles: {
        define: {
          utils: { inherit: "utils", nesting: "any" },
        },
      },
    }).roles.utils;

    expect(inherited).toMatchObject({
      nesting: "any",
      exports: "named-match",
      purpose: expect.any(String),
    });

    const redefined = resolve({
      environment: "src",
      roles: {
        define: {
          utils: { nesting: "any" },
        },
      },
    }).roles.utils;

    expect(redefined).toMatchObject({ nesting: "any" });
    expect(redefined?.exports).toBeUndefined();
    expect(redefined?.purpose).toBeUndefined();
  });

  test("resolves a homonym against the previous layer and any other name against the final root role", () => {
    const roles = resolve({
      environment: "src",
      roles: {
        define: {
          utils: { inherit: "utils", nesting: 1 },
        },
      },
      environmentRoles: {
        define: {
          utils: { inherit: "utils", public: true },
          helpers: { inherit: "utils", purpose: "Helpers." },
        },
      },
    }).roles;

    expect(roles.utils).toMatchObject({
      nesting: 1,
      public: true,
      exports: "named-match",
    });

    expect(roles.helpers).toMatchObject({
      nesting: 1,
      public: true,
      purpose: "Helpers.",
    });
  });

  test("resolves an inline role against root roles unless it names a sibling by its qualified name", () => {
    function define(inherit: string) {
      return {
        foo: {
          roles: [
            { name: "baz", inherit },
            { name: "bar", nesting: 2 },
          ],
        },
      };
    }

    expect(() =>
      resolve({
        environment: "src",
        roles: { define: define("bar") },
      }),
    ).toThrow("inherits bar, which is not defined");

    const roles = resolve({
      environment: "src",
      roles: { define: define("foo/bar") },
      scopes: ["foo/baz"],
    }).roles;

    expect(roles["foo/baz"]).toMatchObject({ nesting: 2, scoped: true });
  });

  test("fails on a cycle with its path and on a homonym without an earlier layer", () => {
    expect(() =>
      resolve({
        environment: "src",
        roles: {
          define: {
            foo: { inherit: "bar" },
            bar: { inherit: "baz" },
            baz: { inherit: "foo" },
          },
        },
      }),
    ).toThrow("foo -> bar -> baz -> foo");

    expect(() =>
      resolve({
        environment: "src",
        roles: {
          define: {
            foo: { inherit: "foo" },
          },
        },
      }),
    ).toThrow("no earlier layer defines it");
  });

  test("renames a file role by inheriting it with another file", () => {
    expect(
      resolve({
        environment: "src",
        roles: {
          define: {
            constants: { inherit: "constants", file: ["consts.ts"] },
          },
        },
      }).roles.constants,
    ).toMatchObject({ file: ["consts.ts"] });
  });

  test("reads the index file name from the index role", () => {
    const roles = resolve({
      environment: "src",
      roles: {
        define: {
          index: { inherit: "index", file: ["main.ts"] },
        },
      },
    });

    expect(getIndexFile(roles)).toBe("main.ts");

    expect(getIndexFile(resolve({ environment: "src", roles: false }))).toBe(
      "index.ts",
    );
  });
});
