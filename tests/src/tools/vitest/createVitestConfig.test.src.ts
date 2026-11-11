import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createServer, mergeConfig } from "vite";
import { describe, expect, test } from "vitest";
import { configDefaults } from "vitest/config";
import { startVitest } from "vitest/node";

import { flatMap, map } from "@auaust/primitive-kit/arrays";

import { loadConfig } from "#project/config/operations/loadConfig";
import { testsetup } from "#project/roles/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { createViteConfig } from "#tools/vite/operations/createViteConfig";
import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";

const root = getFixture("vitest");

const typescriptPackage = fileURLToPath(
  new URL("../../../../node_modules/typescript", import.meta.url),
);

describe("createVitestConfig", () => {
  test("returns only the test layer: sources through the tsconfig paths and the project tsconfig outside build mode", async () => {
    const config = await loadConfig(root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    expect(await vitestConfig).not.toHaveProperty("root");
    expect(await vitestConfig).not.toHaveProperty("build");

    expect(await vitestConfig).toMatchObject({
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
      (
        await createVitestConfig(
          config,
          {
            command: "serve",
            mode: "test",
          },
          {
            guardOutDir: false,
          },
        )
      ).plugins,
    ).toEqual([]);
  });

  test("loads the setup file of the tests root unless the options give others", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": `export default { tests: { roles: ${JSON.stringify([testsetup()])} } };\n`,
      "tests/setup.ts": "",
    });

    const config = await loadConfig(project.root);

    const env = { command: "serve", mode: "test" } as const;

    expect((await createVitestConfig(config, env)).test?.setupFiles).toEqual([
      "tests/setup.ts",
    ]);

    expect(
      (
        await createVitestConfig(config, env, {
          setupFiles: ["other.ts"],
        })
      ).test?.setupFiles,
    ).toEqual(["other.ts"]);
  });

  test("tests the build output with the dist tsconfig in build mode", async () => {
    const config = await loadConfig(root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "build",
    });

    expect((await vitestConfig).tsconfig).toBe(
      join(root, "tsconfig.tests.dist.json"),
    );

    expect((await vitestConfig).test?.typecheck?.tsconfig).toBe(
      join(root, "tsconfig.tests.dist.json"),
    );

    expect((await vitestConfig).resolve?.tsconfigPaths).toBe(false);
    expect((await vitestConfig).plugins).toHaveLength(1);
  });

  test("fails in build mode when the dist tsconfig is missing", async () => {
    const config = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": 'export default { preset: "library" };\n',
        "tests/index.test.ts": "",
      }).root,
    );

    await expect(() => {
      return createVitestConfig(config, {
        command: "serve",
        mode: "build",
      });
    }).rejects.toThrow(
      "The dist tsconfig tsconfig.tests.dist.json does not exist",
    );
  });

  test("fails only when a package import resolves into the build output, even through a symlinked root", async () => {
    const project = createTemporaryProject();

    const linkedRoot = project.resolve("linked");

    symlinkSync(root, linkedRoot);

    for (const projectRoot of [root, linkedRoot]) {
      const config = await loadConfig(projectRoot);

      const server = await createServer({
        ...mergeConfig(
          await createViteConfig(config, {
            isTesting: true,
          }),
          await createVitestConfig(config, {
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
      "tsconfig.json": '{ "files": [], "references": [{ "path": "./tsconfig.tests.json" }] }',
      "tsconfig.tests.json": '{ "compilerOptions": { "strict": true, "noEmit": true, "composite": true, "noEmitOnError": false, "types": [] }, "include": ["tests"] }',
      "tests/example.test-d.ts": 'const value: number = "text";\nexport { value };\n',
    });

    mkdirSync(project.resolve("node_modules/.bin"), { recursive: true });

    symlinkSync(typescriptPackage, project.resolve("node_modules/typescript"));

    symlinkSync(
      "../typescript/bin/tsc",
      project.resolve("node_modules/.bin/tsc"),
    );

    const config = await loadConfig(project.root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    const typecheckTsconfig = project.resolve("tsconfig.tests.json");

    expect((await vitestConfig).test?.typecheck?.tsconfig).toBe(
      typecheckTsconfig,
    );

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
      const errors = flatMap(vitest.state.getFiles(), (file) => {
        return file.result?.errors ?? [];
      });

      expect(map(errors, ({ message }) => message)).toContain(
        "Type 'string' is not assignable to type 'number'.",
      );
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
      "engrenage.config.ts": 'export default { typescript: { tsconfig: { path: "tsconfig.base.json" } } };\n',
      "tsconfig.base.json": "{}",
    });

    const config = await loadConfig(project.root);

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    expect((await vitestConfig).tsconfig).toBe(
      join(project.root, "tsconfig.base.json"),
    );
  });
});

describe("createVitestConfig in a Git repository", () => {
  test("excludes what Git ignores, through info/exclude too", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "tests/a.test.ts": "\n",
      "worktrees/copy/tests/a.test.ts": "\n",
    });

    execFileSync("git", ["init", "--quiet"], { cwd: project.root });

    project.write(".git/info/exclude", "worktrees/\n");

    const vitestConfig = await createVitestConfig(
      await loadConfig(project.root),
      {
        command: "serve",
        mode: "test",
      },
    );

    expect(vitestConfig.test?.exclude).toContain("worktrees/**");
    expect(vitestConfig.test?.exclude).not.toContain("tests/**");
  });
});
