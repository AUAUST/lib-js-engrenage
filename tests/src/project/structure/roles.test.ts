import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function createProject(config: string) {
  return createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "engrenage.config.ts": `export default ${config};\n`,
    "src/.gitkeep": "",
    "tests/.gitkeep": "",
  });
}

describe("roles", () => {
  test("resolve per environment from the configuration", async () => {
    const project = createProject(`{
      roles: { disable: ["types"], define: { operations: { exports: "named-match" } } },
      tests: { roles: { enable: ["types"] } },
    }`);

    const config = await loadConfig(project.root);

    expect(config.src.roles.roles).not.toHaveProperty("types");

    expect(config.src.roles.roles.operations).toMatchObject({
      exports: "named-match",
    });

    expect(config.tests.roles.roles).toHaveProperty("types");
    expect(config.bin.roles.roles).toEqual({});
    expect(config.data.roles.roles).toEqual({});
  });

  test("are off with `roles: false`", async () => {
    const project = createProject("{ roles: false }");

    const config = await loadConfig(project.root);

    expect(config.src.roles.roles).toEqual({});
    expect(config.tests.roles.roles).toEqual({});
  });
});
