import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { defineViteConfig } from "@auaust/engrenage/vite";
import {
  createVitestLayer,
  defineVitestConfig,
} from "@auaust/engrenage/vitest";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";
import { mockCwd } from "#tests/helpers/mockCwd";

const root = getFixture("vitest");

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("defineViteConfig", () => {
  test("applies the project defaults under the native config", async () => {
    mockCwd(root);

    vi.stubEnv("VITEST", undefined);

    const viteConfig = await defineViteConfig(
      {},
      {
        build: {
          sourcemap: true,
        },
      },
    )({
      command: "build",
      mode: "production",
    });

    expect(viteConfig).toMatchObject({
      root,
      tsconfig: join(root, "tsconfig.json"),
      resolve: {
        tsconfigPaths: true,
      },
      build: {
        outDir: "build",
        emptyOutDir: true,
        sourcemap: true,
      },
    });
  });

  test("passes test-scoped globals only when Vitest runs the config", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "type": "module" }',
      "engrenage.config.ts": `export default ${JSON.stringify({
        define: {
          values: {
            __SHARED__: 1,
            __FIXTURES__: {
              "~definition": true,
              "value": "fixtures",
              "exact": false,
              "scope": "test",
            },
          },
        },
      })};\n`,
    });

    mockCwd(project.root);

    const viteConfig = defineViteConfig();

    const env = {
      command: "serve",
      mode: "build",
    } as const;

    vi.stubEnv("VITEST", "true");

    const testConfig = await viteConfig(env);

    expect(testConfig.define).toEqual({
      __SHARED__: "1",
      __FIXTURES__: '"fixtures"',
    });

    vi.stubEnv("VITEST", undefined);

    const runtimeConfig = await viteConfig(env);

    expect(runtimeConfig.define).toEqual({
      __SHARED__: "1",
    });
  });

  test("applies the Vitest layer like defineVitestConfig", async () => {
    mockCwd(root);

    for (const mode of ["test", "build"]) {
      const env = {
        command: "serve",
        mode,
      } as const;

      const layered = await defineViteConfig({
        test: createVitestLayer({
          guardOutDir: false,
        }),
      })(env);

      const vitestConfig = await defineVitestConfig({
        guardOutDir: false,
      })(env);

      expect(layered).toEqual(vitestConfig);
      expect(layered.test?.typecheck?.tsconfig).toBe(layered.tsconfig);
    }
  });

  test("accepts a native config or a function of the context as the test layer", async () => {
    mockCwd(root);

    const env = {
      command: "serve",
      mode: "test",
    } as const;

    const native = await defineViteConfig({
      test: {
        test: {
          environment: "jsdom",
        },
      },
    })(env);

    const computed = await defineViteConfig({
      test(config, { mode }) {
        return Promise.resolve({
          test: {
            name: `${config.packageJson.name}:${mode}`,
          },
        });
      },
    })(env);

    expect(native.test).toEqual({
      environment: "jsdom",
    });

    expect(computed.test?.name).toBe("@fixture/vitest:test");
  });
});
