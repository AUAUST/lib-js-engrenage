import { describe, expect, test } from "vitest";

import { createProjectConfig } from "#project/config/index";
import { constants, types } from "#project/roles/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";

const fixture = {
  name: "preset-fixture",
  contributes: {
    presets: [
      {
        name: "fixture",
        traits: [],
        load() {
          return Promise.resolve({
            "src.roles": [constants()],
            "src.generated": ["preset/**"],
          });
        },
      },
    ],
  },
};

function createFixtureConfig(input: Readonly<Record<string, unknown>>) {
  return createProjectConfig({
    root: createTemporaryProject().root,
    raw: withSourceRuntime({
      extensions: [fixture],
      preset: "fixture",
      ...input,
    }),
    configFile: undefined,
  });
}

async function resolveSource(input: Readonly<Record<string, unknown>>) {
  const source = await createFixtureConfig(input).resolve("src.options");

  return {
    roles: "roles" in source ? source.roles.map(({ name }) => name) : [],
    generated: "generated" in source ? source.generated : [],
  };
}

describe("preset values", () => {
  test("replace the default of the option at their input path", async () => {
    expect((await resolveSource({})).roles).toEqual(["constants"]);
  });

  test("yield to the input the config sets at that path", async () => {
    const { roles } = await resolveSource({
      src: { roles: [types()] },
    });

    expect(roles).toEqual(["types"]);
  });

  test("take the list adjustment the config sets at that path", async () => {
    const { generated } = await resolveSource({
      src: {
        generated: { append: ["config/**"] },
      },
    });

    expect(generated).toEqual(["preset/**", "config/**"]);
  });

  test("report the preset as the origin of a value only it sets", async () => {
    const preset = createFixtureConfig({});

    const configured = createFixtureConfig({
      src: { generated: ["config/**"] },
    });

    expect(await preset.origin("src.options", "src.generated")).toEqual({
      layer: "default",
      name: 'preset "fixture"',
    });

    expect(await configured.origin("src.options", "src.generated")).toEqual({
      layer: "input",
    });
  });
});
