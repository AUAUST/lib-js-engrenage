import { describe, expect, test } from "vitest";

import {
  binSection,
  dataSection,
  loadConfig,
  sourceSection,
  testsSection,
} from "@auaust/engrenage";
import { createRolePreset, utils } from "@auaust/engrenage/roles";

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
  test("resolve the roles each environment lists, and none elsewhere", async () => {
    const project = createProject({
      src: { roles: [utils({ nesting: 1 })] },
    });

    const config = await loadConfig(project.root);
    const { roles } = (await config.resolve(sourceSection)).roles;

    expect(roles).toEqual({ utils: expect.objectContaining({ nesting: 1 }) });
    expect((await config.resolve(testsSection)).roles.roles).toEqual({});
    expect((await config.resolve(binSection)).roles.roles).toEqual({});
    expect((await config.resolve(dataSection)).roles.roles).toEqual({});
  });

  test("report two roles named alike in one list and nest a built preset", async () => {
    const duplicated = createProject({
      src: { roles: [utils(), utils()] },
    });

    await expect(
      (await loadConfig(duplicated.root)).resolve(sourceSection),
    ).rejects.toThrow("src.roles[0] and src.roles[1] are both named utils");

    const helpers = createRolePreset({ name: "helpers", purpose: "Helpers." });

    const nested = createProject({
      src: { roles: [utils({ roles: [helpers()] })] },
    });

    expect(
      (await (await loadConfig(nested.root)).resolve(sourceSection)).roles.roles
        .utils,
    ).toMatchObject({ roles: ["utils/helpers"] });
  });
});
