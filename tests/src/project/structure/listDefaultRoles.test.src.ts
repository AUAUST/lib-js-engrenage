import { describe, expect, test } from "vitest";

import { createRolePreset } from "#batiment/roles/index";
import { createProjectConfig } from "#project/config/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const helpers = createRolePreset({
  name: "helpers",
  purpose: "Helpers.",
});

function createConfig(contribution: string, omitRoles: readonly string[]) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "src/.gitkeep": "",
  });

  return createProjectConfig({
    root: project.root,
    raw: withSourceRuntime({
      traits: {
        enable: ["published"],
      },
      src: {
        omitRoles,
      },
      extensions: [
        {
          name: "helpers",
          contributes: {
            roles: [
              {
                name: contribution,
                load() {
                  return Promise.resolve(helpers);
                },
                environments: ["src"],
              },
            ],
          },
        },
      ],
    }),
    configFile: undefined,
  });
}

describe("listDefaultRoles", () => {
  test("lets omitRoles drop a default role by the name of its contribution", async () => {
    const config = createConfig("helpers", ["entrypoint", "helpers"]);

    const roles = (await config.resolve("environmentRoles")).src?.roles;

    expect(roles).not.toHaveProperty("entrypoint");

    expect(roles).not.toHaveProperty("helpers");
  });

  test("rejects a contribution named after another role than its preset creates", async () => {
    const config = createConfig("helper", []);

    await expect(config.resolve("environmentRoles")).rejects.toThrow(
      'The "helper" roles contribution creates the "helpers" role',
    );
  });
});
