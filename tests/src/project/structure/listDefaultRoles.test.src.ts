import { describe, expect, test } from "vitest";

import { createRolePreset } from "#batiment/roles/index";
import { declareSection } from "#foundation/options/index";
import { createProjectConfig, type Extension } from "#project/config/index";
import { sourceOptionsSection } from "#project/environments/config/sections/sourceOptionsSection";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const helpers = createRolePreset({
  name: "helpers",
  purpose: "Helpers.",
});

const librarySection = declareSection({
  resolve() {
    return { active: true, dirs: ["lib"] };
  },
});

// @debt near-twin of the `site` fixture in `contributedEnvironments.test.src.ts`: an extension owning an environment key and its options key and contributing it under a kind; a shared test util would build both
const library: Extension = {
  name: "fixture/lib",
  owns: {
    keys: {
      "lib": {
        load() {
          return Promise.resolve(librarySection);
        },
      },
      "lib.options": {
        input: "lib",
        load() {
          return Promise.resolve(sourceOptionsSection);
        },
      },
    },
  },
  contributes: {
    namespaceKinds: [
      {
        name: "lib",
        level: "enforced",
        structure: "domains",
      },
    ],
    environments: [
      {
        name: "lib",
        kind: "src",
        title: "the library",
      },
    ],
  },
};

function createConfig(
  contribution: string,
  omitRoles: readonly string[],
  extensions: readonly Extension[] = [],
) {
  const project = createTemporaryProject({
    "package.json": '{ "name": "project", "type": "module" }',
    "src/.gitkeep": "",
    "lib/.gitkeep": "",
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
        ...extensions,
        {
          name: "helpers",
          contributes: {
            roles: [
              {
                name: contribution,
                load() {
                  return Promise.resolve(helpers);
                },
                environments: ["src", "lib"],
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

  test("applies the defaults of the namespace kind named like an environment", async () => {
    const config = createConfig("helpers", [], [library]);

    const roles = (await config.resolve("environmentRoles")).lib?.roles;

    expect(roles).toHaveProperty("helpers");
  });
});
