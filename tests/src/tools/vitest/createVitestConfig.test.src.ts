import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";

import { createServer, mergeConfig } from "vite";
import { describe, expect, test } from "vitest";
import { configDefaults } from "vitest/config";
import { startVitest } from "vitest/node";

import { flatMap, map } from "@auaust/toolkit/array";

import { loadConfig } from "#project/config/operations/loadConfig";
import { testsetup } from "#project/roles/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { getFixture } from "#tests/utils/getFixture";
import { createViteConfig } from "#tools/vite/operations/createViteConfig";
import { createVitestConfig } from "#tools/vitest/operations/createVitestConfig";

const root = getFixture("vitest");

const typescriptPackage = fileURLToPath(
  new URL("../../../../node_modules/typescript", import.meta.url),
);

const vitestPackage = fileURLToPath(
  new URL("../../../../node_modules/vitest", import.meta.url),
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
        isolate: true,
        restoreMocks: false,
        exclude: [...configDefaults.exclude, "tests/**/fixtures/**"],
        coverage: {
          provider: "istanbul",
        },
        typecheck: {
          exclude: [...configDefaults.exclude, "tests/**/fixtures/**"],
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
            plugins: { "out-dir-guard": false },
          },
        )
      ).plugins,
    ).toEqual([]);
  });

  test("collects the configured and Vitest's default test extensions, by mode", async () => {
    const config = await loadConfig(root);

    const include = (
      await createVitestConfig(config, { command: "serve", mode: "test" })
    ).test?.include;

    expect(include).toEqual(
      expect.arrayContaining([
        "**/*.test.ts",
        "**/*.test.?(c|m)[jt]s?(x)",
        "**/*.test.src.?(c|m)[jt]s?(x)",
      ]),
    );

    expect(include?.some((pattern) => pattern.includes(".dist"))).toBe(false);
  });

  test("loads the setup file of the tests root and adds the given ones", async () => {
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
    ).toEqual(["tests/setup.ts", "other.ts"]);
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

  test("fails in build mode when another environment takes every tests file", async () => {
    const config = await loadConfig(
      createTemporaryProject({
        "engrenage.config.ts": [
          "export default {",
          '  preset: "library",',
          '  environments: { probes: { preset: "bin", dirs: ["tests/probes"] } },',
          "};\n",
        ].join("\n"),
        "tests/probes/probe.ts": "",
      }).root,
    );

    await expect(() => {
      return createVitestConfig(config, {
        command: "serve",
        mode: "build",
      });
    }).rejects.toThrow("The tests environment is inactive at the project root");
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
  test("fails the Vitest type check on a wrong type assertion in a test file, running each test once", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "project", "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": '{ "files": [], "references": [{ "path": "./tsconfig.tests.json" }] }',
      "tsconfig.tests.json": '{ "compilerOptions": { "strict": true, "noEmit": true, "composite": true, "noEmitOnError": false, "types": [] }, "include": ["tests"] }',
      "tests/failing.test.ts": 'import { expectTypeOf, test } from "vitest";\ntest("failing", () => {\n  expectTypeOf<string>().toEqualTypeOf<number>();\n});\n',
      "tests/passing.test.ts": 'import { expectTypeOf, test } from "vitest";\ntest("passing", () => {\n  expectTypeOf<number>().toEqualTypeOf<number>();\n});\n',
      "tests/fixtures/ignored.test.ts": 'import { expectTypeOf, test } from "vitest";\ntest("ignored", () => {\n  expectTypeOf<string>().toEqualTypeOf<number>();\n});\n',
    });

    mkdirSync(project.resolve("node_modules/.bin"), {
      recursive: true,
    });

    symlinkSync(typescriptPackage, project.resolve("node_modules/typescript"));

    symlinkSync(vitestPackage, project.resolve("node_modules/vitest"));

    symlinkSync(
      "../typescript/bin/tsc",
      project.resolve("node_modules/.bin/tsc"),
    );

    const config = await loadConfig(project.root);

    const vitestConfig = await createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    expect(vitestConfig.test?.typecheck?.tsconfig).toBe(
      project.resolve("tsconfig.tests.json"),
    );

    const vitest = await startVitest(
      "test",
      [],
      {
        root: project.root,
        config: false,
        run: true,
        watch: false,
        reporters: [],
        exclude: vitestConfig.test?.exclude ?? [],
        typecheck: {
          ...vitestConfig.test?.typecheck,
          enabled: true,
        },
      },
      {},
      {
        stderr: new Writable({
          write(_chunk, _encoding, callback) {
            callback();
          },
        }),
      },
    );

    try {
      const files = vitest.state.getFiles();

      expect(
        map(files, ({ name, meta, result }) => {
          return `${name} ${meta.typecheck === true ? "typecheck" : "runtime"} ${result?.state}`;
        }).toSorted(),
      ).toEqual([
        "tests/failing.test.ts runtime pass",
        "tests/failing.test.ts typecheck fail",
        "tests/passing.test.ts runtime pass",
        "tests/passing.test.ts typecheck pass",
      ]);

      const errors = flatMap(files, (file) => {
        return flatMap(file.tasks, (task) => {
          return task.result?.errors ?? [];
        });
      });

      expect(map(errors, ({ message }) => message).join("\n")).toContain(
        "Expected number, Actual string",
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

    const reporter = createTestReporter();

    const config = await loadConfig(project.root, { reporter });

    const vitestConfig = createVitestConfig(config, {
      command: "serve",
      mode: "test",
    });

    expect((await vitestConfig).tsconfig).toBe(
      join(project.root, "tsconfig.base.json"),
    );

    expect(reporter.warnings).toContain(
      "The base tsconfig tsconfig.base.json is not named tsconfig.json, the only name editors and typed lint discover",
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

    execFileSync("git", ["init", "--quiet"], {
      cwd: project.root,
      stdio: "pipe",
    });

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
