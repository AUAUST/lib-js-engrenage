import { describe, expect, test } from "vitest";

import { defineSection } from "#project/config/index";
import { createDefine } from "#project/config/operations/createDefine";
import { define } from "#project/config/utils/define";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createViteConfig } from "#tools/vite/operations/createViteConfig";
import { createConfig } from "#workflows/registry/operations/createConfig";

async function resolveConfig(input: Record<string, unknown>) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@scope/package",
      type: "module",
    }),
  });

  const config = createConfig({
    root: project.root,
    raw: input,
    configFile: undefined,
  });

  void (await config.resolve(defineSection));

  return config;
}

describe("define", () => {
  test("serializes values and splits them by scope for builds and tests", async () => {
    const config = await resolveConfig({
      define: {
        values: {
          "__DEBUG__": false,
          "__OPTIONS__": {
            retries: 3,
          },
          "__FIXTURES__": define("fixtures", {
            scope: "test",
          }),
          "import.meta.env.MODE": define("production", {
            scope: "build",
          }),
        },
      },
    });

    expect(
      await createDefine(config, {
        isTesting: false,
      }),
    ).toEqual({
      "__DEBUG__": "false",
      "__OPTIONS__": '{"retries":3}',
      "import.meta.env.MODE": '"production"',
    });

    expect(
      (
        await createViteConfig(config, {
          isTesting: true,
        })
      ).define,
    ).toEqual({
      __DEBUG__: "false",
      __OPTIONS__: '{"retries":3}',
      __FIXTURES__: '"fixtures"',
    });
  });

  test("serializes any JSON-serializable value and rejects the rest", async () => {
    const config = await resolveConfig({
      define: {
        values: {
          __BUILT_AT__: new Date("2026-01-01T00:00:00.000Z"),
          __OPTIONS__: define({
            skipped: undefined,
            url: new URL("https://auaust.ch"),
          }),
        },
      },
    });

    expect(
      (await config.resolve(defineSection)).values.__BUILT_AT__,
    ).toMatchObject({
      expression: '"2026-01-01T00:00:00.000Z"',
      value: "2026-01-01T00:00:00.000Z",
    });

    expect(
      (await config.resolve(defineSection)).values.__OPTIONS__?.value,
    ).toEqual({
      url: "https://auaust.ch/",
    });

    await expect(async () => {
      return await resolveConfig({
        define: {
          values: {
            __HANDLERS__: {
              onLoad: String,
            },
          },
        },
      });
    }).rejects.toThrow('JSON-serializable value at key "onLoad"');

    await expect(async () => {
      return await resolveConfig({
        define: {
          values: {
            __SIZE__: 1n,
          },
        },
      });
    }).rejects.toThrow("JSON-serializable value");
  });

  test("computes values from the package and validates them", async () => {
    const config = await resolveConfig({
      define: {
        values({ packageJson }: { packageJson: { name: string } }) {
          return {
            __NAME__: packageJson.name,
          };
        },
      },
    });

    expect(
      (await config.resolve(defineSection)).values.__NAME__?.expression,
    ).toBe('"@scope/package"');

    await expect(async () => {
      return await resolveConfig({
        define: {
          values: {
            __NESTED__: [define(true)],
          },
        },
      });
    }).rejects.toThrow("top-level definition");

    await expect(async () => {
      return await resolveConfig({
        define: {
          values: {
            __CLOSED__: define(true, {
              description: "Ends early */",
            }),
          },
        },
      });
    }).rejects.toThrow("valid top-level definition");

    await expect(async () => {
      return await resolveConfig({
        define: {
          values: {
            "process.env[0]": 1,
          },
        },
      });
    }).rejects.toThrow("dotted path");
  });
});
