import { symlinkSync } from "node:fs";
import { join } from "node:path";

import { loadConfig } from "@auaust/engrenage/config";
import { createVitestConfig } from "@auaust/engrenage/vitest";
import { createServer } from "vite";
import { describe, expect, test } from "vitest";
import { configDefaults } from "vitest/config";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("vitest");

describe("createVitestConfig", () => {
  test("tests sources through the tsconfig paths and the project tsconfig outside build mode", async () => {
    const config = await loadConfig(root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    expect(vitestConfig).toMatchObject({
      root: config.root,
      tsconfig: join(root, "tsconfig.json"),
      build: {
        outDir: "build",
      },
      resolve: {
        tsconfigPaths: true,
      },
      plugins: [
        {
          name: "engrenage:out-dir-guard",
        },
      ],
      test: {
        exclude: [...configDefaults.exclude, "**/fixtures/**"],
        coverage: {
          provider: "istanbul",
        },
        typecheck: {
          tsconfig: join(root, "tsconfig.json"),
        },
      },
    });
    expect(
      createVitestConfig(
        config,
        {
          command: "serve",
          mode: "test",
        },
        {
          guardOutDir: false,
        },
      ).plugins,
    ).toEqual([]);
  });

  test("tests the build output with the dist tsconfig in build mode", async () => {
    const config = await loadConfig(root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "build",
    });

    expect(vitestConfig.tsconfig).toBe(join(root, "tsconfig.dist.json"));
    expect(vitestConfig.test?.typecheck?.tsconfig).toBe(
      join(root, "tsconfig.dist.json"),
    );
    expect(vitestConfig.resolve?.tsconfigPaths).toBe(false);
    expect(vitestConfig.plugins).toEqual([]);
  });

  test("fails only when a package import resolves into the build output, even through a symlinked root", async () => {
    const project = createTemporaryProject();

    const linkedRoot = project.resolve("linked");

    symlinkSync(root, linkedRoot);

    for (const projectRoot of [root, linkedRoot]) {
      const config = await loadConfig(projectRoot);

      const server = await createServer({
        ...createVitestConfig(config, {
          command: "serve",
          mode: "test",
        }),
        configFile: false,
        logLevel: "silent",
      });

      const { pluginContainer } = server.environments.ssr;

      const importer = join(projectRoot, "src/index.ts");

      try {
        await expect(
          pluginContainer.resolveId("@fixture/vitest", importer),
        ).resolves.toMatchObject({
          id: join(root, "src/index.ts"),
        });
        await expect(
          pluginContainer.resolveId("@fixture/vitest/data.json", importer),
        ).resolves.toMatchObject({
          id: join(root, "data/data.json"),
        });
        await expect(
          pluginContainer.resolveId("@fixture/vitest/extra", importer),
        ).rejects.toThrow(
          "'@fixture/vitest/extra' resolves to the build output",
        );
      } finally {
        await server.close();
      }
    }
  });
});
