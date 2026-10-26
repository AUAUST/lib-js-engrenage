import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "@auaust/engrenage/config";
import { createVitestConfig } from "@auaust/engrenage/vitest";
import { createServer } from "vite";
import { describe, expect, test } from "vitest";
import { configDefaults } from "vitest/config";

const root = fileURLToPath(new URL("../fixtures/vitest", import.meta.url));

describe("createVitestConfig", () => {
  test("tests sources with source aliases and the project tsconfig outside build mode", async () => {
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
        alias: [
          {
            replacement: join(root, "src/index.ts"),
          },
        ],
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
    expect(vitestConfig.resolve?.alias).toEqual([]);
    expect(vitestConfig.plugins).toEqual([]);
  });

  test("fails only when a package import resolves into the build output", async () => {
    const config = await loadConfig(root);

    const server = await createServer({
      ...createVitestConfig(config, {
        command: "serve",
        mode: "test",
      }),
      configFile: false,
      logLevel: "silent",
    });

    const { pluginContainer } = server.environments.ssr;

    const importer = join(root, "src/index.ts");

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
      ).rejects.toThrow("'@fixture/vitest/extra' resolves to the build output");
    } finally {
      await server.close();
    }
  });
});
