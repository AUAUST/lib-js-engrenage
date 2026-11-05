import { describe, expect, test } from "vitest";

import {
  binSection,
  dataSection,
  loadConfig,
  sourceSection,
  testsSection,
} from "@auaust/engrenage";

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

    expect(
      (await config.resolve(sourceSection)).roles.roles,
    ).not.toHaveProperty("types");

    expect(
      (await config.resolve(sourceSection)).roles.roles.operations,
    ).toMatchObject({
      exports: "named-match",
    });

    expect((await config.resolve(testsSection)).roles.roles).toHaveProperty(
      "types",
    );

    expect((await config.resolve(binSection)).roles.roles).toEqual({});
    expect((await config.resolve(dataSection)).roles.roles).toEqual({});
  });

  test("are off with `roles: false`", async () => {
    const project = createProject("{ roles: false }");

    const config = await loadConfig(project.root);

    expect((await config.resolve(sourceSection)).roles.roles).toEqual({});
    expect((await config.resolve(testsSection)).roles.roles).toEqual({});
  });
});
