import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { defineViteConfig } from "@auaust/engrenage/vite";
import {
  createVitestLayer,
  defineVitestConfig,
} from "@auaust/engrenage/vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";

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
      root: join(root, "src"),
      tsconfig: join(root, "tsconfig.json"),
      resolve: {
        tsconfigPaths: true,
      },
      build: {
        outDir: join(root, "build"),
        emptyOutDir: true,
        sourcemap: true,
      },
    });
  });

  describe("with several src.dirs", () => {
    function createProject() {
      return createTemporaryProject({
        "package.json": JSON.stringify({
          type: "module",
          devDependencies: { vite: "*" },
        }),
        "engrenage.config.ts": `export default ${JSON.stringify({
          src: {
            dirs: ["src", "admin"],
          },
          environments: {
            src: {
              execution: { syntax: "2026-10" },
            },
          },
          build: {
            outDir: "dist",
          },
        })};\n`,
        "src/index.ts": "",
        "admin/index.ts": "",
      });
    }

    const env = {
      command: "build",
      mode: "production",
    } as const;

    test("falls back to the project root, keeping outDir and envDir there", async () => {
      const project = createProject();

      vi.stubEnv("VITEST", undefined);

      const viteConfig = await defineViteConfig.at(project.root)()(env);

      expect(viteConfig).toMatchObject({
        root: project.root,
        envDir: project.root,
        build: { outDir: join(project.root, "dist") },
      });
    });

    test("takes root from a native config setting it", async () => {
      const project = createProject();

      vi.stubEnv("VITEST", undefined);

      const viteConfig = await defineViteConfig.at(project.root)(
        undefined,
        ({ context }) => {
          return { root: join(context.root, "admin") };
        },
      )(env);

      expect(viteConfig).toMatchObject({
        root: join(project.root, "admin"),
        envDir: project.root,
        build: { outDir: join(project.root, "dist") },
      });
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
          plugins: { "out-dir-guard": false },
        }),
      })(env);

      const vitestConfig = await defineVitestConfig({
        plugins: { "out-dir-guard": false },
      })(env);

      expect({ ...layered, plugins: undefined }).toEqual({
        ...vitestConfig,
        plugins: undefined,
      });

      expect(layered.test?.typecheck?.tsconfig).toBe(
        join(
          root,
          mode === "build" ? "tsconfig.tests.dist.json" : "tsconfig.tests.json",
        ),
      );
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
      async test(config, { mode }) {
        const { name } = await config.resolve("packageJson");

        return {
          test: { name: `${name}:${mode}` },
        };
      },
    })(env);

    expect(native.test).toEqual({
      environment: "jsdom",
    });

    expect(computed.test?.name).toBe("@fixture/vitest:test");
  });
});
