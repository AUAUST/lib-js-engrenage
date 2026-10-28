import { describe, expect, test } from "vitest";

import { define } from "#config/config/define";
import { configSchema } from "#config/config/schemas/configSchema";
import { createDefine } from "#config/utils/createDefine";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { validate } from "#utils/validate";
import { createViteConfig } from "#vite/config/createViteConfig";

function resolveConfig(input: unknown) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@scope/package",
      type: "module",
    }),
  });

  return createResolvedConfig({
    root: project.root,
    raw: validate(configSchema, input, "test config"),
    configFile: undefined,
  });
}

describe("define", () => {
  test("serializes values and splits them by scope for builds and tests", () => {
    const config = resolveConfig({
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
      createDefine(config, {
        isTesting: false,
      }),
    ).toEqual({
      "__DEBUG__": "false",
      "__OPTIONS__": '{"retries":3}',
      "import.meta.env.MODE": '"production"',
    });

    expect(
      createViteConfig(config, {
        isTesting: true,
      }).define,
    ).toEqual({
      __DEBUG__: "false",
      __OPTIONS__: '{"retries":3}',
      __FIXTURES__: '"fixtures"',
    });
  });

  test("serializes any JSON-serializable value and rejects the rest", () => {
    const config = resolveConfig({
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

    expect(config.define.values.__BUILT_AT__).toMatchObject({
      expression: '"2026-01-01T00:00:00.000Z"',
      value: "2026-01-01T00:00:00.000Z",
    });

    expect(config.define.values.__OPTIONS__?.value).toEqual({
      url: "https://auaust.ch/",
    });

    expect(() => {
      return resolveConfig({
        define: {
          values: {
            __HANDLERS__: {
              onLoad: String,
            },
          },
        },
      });
    }).toThrow('JSON-serializable value at key "onLoad"');

    expect(() => {
      return resolveConfig({
        define: {
          values: {
            __SIZE__: 1n,
          },
        },
      });
    }).toThrow("JSON-serializable value");
  });

  test("computes values from the package and validates them", () => {
    const config = resolveConfig({
      define: {
        values({ packageJson }: { packageJson: { name: string } }) {
          return {
            __NAME__: packageJson.name,
          };
        },
      },
    });

    expect(config.define.values.__NAME__?.expression).toBe('"@scope/package"');

    expect(() => {
      return resolveConfig({
        define: {
          values: {
            __NESTED__: [define(true)],
          },
        },
      });
    }).toThrow("top-level definition");

    expect(() => {
      return resolveConfig({
        define: {
          values: {
            __CLOSED__: define(true, {
              description: "Ends early */",
            }),
          },
        },
      });
    }).toThrow("valid top-level definition");

    expect(() => {
      return resolveConfig({
        define: {
          values: {
            "process.env[0]": 1,
          },
        },
      });
    }).toThrow("dotted path");
  });
});
