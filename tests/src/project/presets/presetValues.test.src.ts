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

async function resolveSource(input: Readonly<Record<string, unknown>>) {
  const config = createProjectConfig({
    root: createTemporaryProject().root,
    raw: withSourceRuntime({
      extensions: [fixture],
      preset: "fixture",
      ...input,
    }),
    configFile: undefined,
  });

  const source = await config.resolve("src.options");

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
});
