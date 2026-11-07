import { afterEach, describe, expect, test, vi } from "vitest";

import { defineSection, loadConfig } from "@auaust/engrenage";
import { define } from "@auaust/engrenage/config";
import { defineViteConfig } from "@auaust/engrenage/vite";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";

const inputKey = "__engrenageDefineTestInput__";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

async function resolveConfig(input: Record<string, unknown>) {
  vi.stubGlobal(inputKey, input);

  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "@scope/package",
      type: "module",
    }),
    "engrenage.config.ts": `export default globalThis.${inputKey};\n`,
  });

  const config = await loadConfig(project.root);

  void (await config.resolve(defineSection));

  return { config, root: project.root };
}

async function readViteDefine(root: string, testing: boolean) {
  mockCwd(root);

  vi.stubEnv("VITEST", testing ? "true" : undefined);

  const viteConfig = await defineViteConfig()({
    command: "build",
    mode: "production",
  });

  return viteConfig.define;
}

describe("define", () => {
  test("serializes values and splits them by scope for builds and tests", async () => {
    const { root } = await resolveConfig({
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

    expect(await readViteDefine(root, false)).toEqual({
      "__DEBUG__": "false",
      "__OPTIONS__": '{"retries":3}',
      "import.meta.env.MODE": '"production"',
    });

    expect(await readViteDefine(root, true)).toEqual({
      __DEBUG__: "false",
      __OPTIONS__: '{"retries":3}',
      __FIXTURES__: '"fixtures"',
    });
  });

  test("serializes any JSON-serializable value and rejects the rest", async () => {
    const { config } = await resolveConfig({
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
    const { config } = await resolveConfig({
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
