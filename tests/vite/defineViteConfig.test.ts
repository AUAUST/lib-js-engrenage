import { join } from "node:path";

import { afterEach, describe, expect, test, vi } from "vitest";

import { defineViteConfig } from "@auaust/engrenage/vite";
import {
  createVitestLayer,
  defineVitestConfig,
} from "@auaust/engrenage/vitest";

import { getFixture } from "#tests/helpers/getFixture";
import { mockCwd } from "#tests/helpers/mockCwd";

const root = getFixture("vitest");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("defineViteConfig", () => {
  test("applies the project defaults under the native config", async () => {
    mockCwd(root);

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
        sourcemap: true,
      },
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
});
