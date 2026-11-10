import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { index } from "#project/roles/index";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import { resolveRoles } from "#project/structure/utils/resolveRoles";

describe("listEnvironmentRoles", () => {
  test("lets a listed role replace the layout's role of the same name", () => {
    const resolved = resolveRoles({
      environment: "scripts",
      roles: listEnvironmentRoles({
        tree: "commands",
        roles: [index({ purpose: "The group." })],
      }) ?? [],
      effects: {
        levels: undefined,
        modules: undefined,
        fallback: undefined,
      },
      verbatimModuleSyntax: true,
    });

    expect(resolved.roles.index?.purpose).toBe("The group.");

    expect(keys(resolved.roles)).toEqual([
      "index",
      "executable",
      "commands",
      "actions",
    ]);
  });
});
