import { describe, expect, test } from "vitest";

import { keys } from "@auaust/toolkit/object";

import { noEffects } from "#batiment/effects/constants";
import { listNamespaceRoles, resolveRoles } from "#batiment/roles/index";
import {
  actions,
  commands,
  executable,
  index,
  utils,
} from "#project/roles/index";

describe("listNamespaceRoles", () => {
  test("lets a listed role replace the layout's role of the same name", () => {
    const resolved = resolveRoles({
      namespace: "scripts",
      roles: listNamespaceRoles({
        namespace: "scripts",
        layoutRoles: [index(), executable(), commands(), actions()],
        roles: [index({ purpose: "The group." })],
        defaults: [],
      }),
      effects: noEffects,
      typeImports: true,
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
    const roles = listNamespaceRoles({
      namespace: "src",
      roles: [utils({ effects: "pure" })],
      defaults: [index(), utils()],
    });

    expect(roles.map(({ name }) => name)).toEqual(["index", "utils"]);

    expect(roles[1]?.effects).toBe("pure");
  });

  test("drops an omitted default", () => {
    const roles = listNamespaceRoles({
      namespace: "src",
      omitRoles: ["index"],
      defaults: [index(), utils()],
    });

    expect(roles.map(({ name }) => name)).toEqual(["utils"]);
  });

  test("rejects omitting a role that is no default", () => {
    expect(() => {
      return listNamespaceRoles({
        namespace: "src",
        omitRoles: ["pages"],
        defaults: [index(), utils()],
      });
    }).toThrow(/"pages"/v);
  });
});
