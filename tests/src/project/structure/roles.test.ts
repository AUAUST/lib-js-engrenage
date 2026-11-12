import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { createRolePreset, utils } from "@auaust/engrenage/roles";
import { keys } from "@auaust/toolkit/object";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createProject(config: object) {
  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default ${JSON.stringify(config)};\n`,
    "src/.gitkeep": "",
    "tests/.gitkeep": "",
  });
}

describe("roles", () => {
  test("resolve the roles each environment lists, and only the layout's roles for a commands environment", async () => {
    const project = createProject({
      src: { roles: [utils({ nesting: 1 })] },
    });

    const config = await loadConfig(project.root);

    const roles = await config.resolve("environmentRoles");

    expect(roles.src?.roles).toEqual({
      utils: expect.objectContaining({ nesting: 1 }),
    });

    expect(roles.tests?.roles).toEqual({});

    expect(keys(roles.bin?.roles ?? {})).toEqual([
      "index",
      "executable",
      "commands",
      "actions",
    ]);
  });

  test("resolve no roles for a disabled environment", async () => {
    const project = createProject({ tests: false });

    const config = await loadConfig(project.root);

    expect((await config.resolve("environmentRoles")).tests?.roles).toEqual({});
  });

  test("report two roles named alike in one list and nest a built preset", async () => {
    const duplicated = createProject({
      src: { roles: [utils(), utils()] },
    });

    await expect(
      (await loadConfig(duplicated.root)).resolve("environmentRoles"),
    ).rejects.toThrow("src.roles[0] and src.roles[1] are both named utils");

    const helpers = createRolePreset({
      name: "helpers",
      purpose: "Helpers.",
    });

    const nested = createProject({
      src: { roles: [utils({ roles: [helpers()] })] },
    });

    expect(
      (await (await loadConfig(nested.root)).resolve("environmentRoles")).src
        ?.roles.utils,
    ).toMatchObject({ roles: ["utils/helpers"] });
  });
});
