import { symlinkSync } from "node:fs";
import { join } from "node:path";

import { createServer, mergeConfig } from "vite";
import { describe, expect, test } from "vitest";
import { configDefaults } from "vitest/config";
import { startVitest } from "vitest/node";

import { loadConfig } from "@auaust/engrenage/config";
import { createViteConfig } from "@auaust/engrenage/vite";
import { createVitestConfig } from "@auaust/engrenage/vitest";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("vitest");

describe("createVitestConfig", () => {
  test("returns only the test layer: sources through the tsconfig paths and the project tsconfig outside build mode", async () => {
    const config = await loadConfig(root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    expect(vitestConfig).not.toHaveProperty("root");
    expect(vitestConfig).not.toHaveProperty("build");

    expect(vitestConfig).toMatchObject({
      tsconfig: join(root, "tsconfig.json"),
      resolve: {
        tsconfigPaths: true,
      },
      plugins: [
        {
          name: "engrenage:out-dir-guard",
        },
      ],
      test: {
        isolate: false,
        restoreMocks: true,
        exclude: [...configDefaults.exclude, "tests/**/fixtures/**"],
        coverage: {
          provider: "istanbul",
        },
        typecheck: {
          tsconfig: join(root, "tsconfig.tests.json"),
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

    expect(vitestConfig.tsconfig).toBe(join(root, "tsconfig.tests.dist.json"));

    expect(vitestConfig.test?.typecheck?.tsconfig).toBe(
      join(root, "tsconfig.tests.dist.json"),
    );

    expect(vitestConfig.resolve?.tsconfigPaths).toBe(false);
    expect(vitestConfig.plugins).toEqual([]);
  });

  test("fails in build mode when the dist tsconfig is missing", async () => {
    const config = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": "export default {};\n",
        "tests/index.test.ts": "",
      }).root,
    );

    expect(() => {
      return createVitestConfig(config, {
        command: "serve",
        mode: "build",
      });
    }).toThrow("The dist tsconfig tsconfig.tests.dist.json does not exist");
  });

  test("fails only when a package import resolves into the build output, even through a symlinked root", async () => {
    const project = createTemporaryProject();

    const linkedRoot = project.resolve("linked");

    symlinkSync(root, linkedRoot);

    for (const projectRoot of [root, linkedRoot]) {
      const config = await loadConfig(projectRoot);

      const server = await createServer({
        ...mergeConfig(
          createViteConfig(config, {
            isTesting: true,
          }),
          createVitestConfig(config, {
            command: "serve",
            mode: "test",
          }),
        ),
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

describe("createVitestConfig type checking", () => {
  test("fails the Vitest type check on a type error in a test", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json":
        '{ "files": [], "references": [{ "path": "./tsconfig.tests.json" }] }',
      "tsconfig.tests.json":
        '{ "compilerOptions": { "strict": true, "noEmit": true, "composite": true, "noEmitOnError": false, "types": [] }, "include": ["tests"] }',
      "tests/example.test-d.ts":
        'const value: number = "text";\nexport { value };\n',
    });

    const config = await loadConfig(project.root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    const typecheckTsconfig = project.resolve("tsconfig.tests.json");

    expect(vitestConfig.test?.typecheck?.tsconfig).toBe(typecheckTsconfig);

    const vitest = await startVitest("test", [], {
      root: project.root,
      config: false,
      run: true,
      watch: false,
      reporters: [],
      typecheck: {
        enabled: true,
        include: ["tests/**/*.test-d.ts"],
        tsconfig: typecheckTsconfig,
      },
    });

    try {
      expect(
        vitest.state.getCountOfFailedTests() +
          vitest.state
            .getFiles()
            .filter((file) => file.result?.state === "fail").length,
      ).toBeGreaterThan(0);
    } finally {
      await vitest.close();

      process.exitCode = undefined;
    }
  });
});

describe("createVitestConfig with a renamed base tsconfig", () => {
  test("receives the configured base tsconfig", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts":
        'export default { typescript: { tsconfig: { path: "tsconfig.base.json" } } };\n',
      "tsconfig.base.json": "{}",
    });

    const config = await loadConfig(project.root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    expect(vitestConfig.tsconfig).toBe(
      join(project.root, "tsconfig.base.json"),
    );
  });
});
