import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { index, utils } from "#project/roles/index";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import { resolveRoles } from "#project/structure/utils/resolveRoles";

describe("listEnvironmentRoles", () => {
  test("lets a listed role replace the layout's role of the same name", () => {
    const resolved = resolveRoles({
      environment: "scripts",
      roles: listEnvironmentRoles({
        environment: "scripts",
        tree: "commands",
        roles: [index({ purpose: "The group." })],
        defaults: [],
      }),
      effects: {
        levels: undefined,
        modules: undefined,
        fallback: undefined,
      },
      verbatimModuleSyntax: true,
      published: true,
    });

    expect(resolved.roles.index?.purpose).toBe("The group.");

    expect(keys(resolved.roles)).toEqual([
      "index",
      "executable",
      "commands",
      "actions",
    ]);
  });

  test("lets a listed role replace the default of its name", () => {
    const roles = listEnvironmentRoles({
      environment: "src",
      roles: [utils({ effects: "pure" })],
      defaults: [index(), utils()],
    });

    expect(roles.map(({ name }) => name)).toEqual(["index", "utils"]);

    expect(roles[1]?.effects).toBe("pure");
  });

  test("drops an omitted default", () => {
    const roles = listEnvironmentRoles({
      environment: "src",
      omitRoles: ["index"],
      defaults: [index(), utils()],
    });

    expect(roles.map(({ name }) => name)).toEqual(["utils"]);
  });

  test("rejects omitting a role that is no default", () => {
    expect(() => {
      return listEnvironmentRoles({
        environment: "src",
        omitRoles: ["pages"],
        defaults: [index(), utils()],
      });
    }).toThrow(/"pages"/v);
  });
});
