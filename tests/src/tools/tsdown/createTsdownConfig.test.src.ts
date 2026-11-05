import { build } from "tsdown";
import { createProgram, getPreEmitDiagnostics } from "typescript";
import { describe, expect, test } from "vitest";

import { define } from "#project/config/utils/define";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { withSourceRuntime } from "#tests/utils/withSourceRuntime";
import { createTsdownConfig } from "#tools/tsdown/operations/createTsdownConfig";
import { syncEnvFile } from "#tools/typescript/setup/syncEnvFile";
import { loadConfig } from "#workflows/registry/operations/loadConfig";

const root = getFixture("tsdown");

describe("createTsdownConfig", () => {
  test("preserves synced global types in exported declarations", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
      }),
      "engrenage.config.ts": `export default ${JSON.stringify({
        src: { baseline: "2026-10" },
        define: {
          values: {
            __NAME__: "package",
            __OPTIONS__: { retries: 3, modes: ["fast", "safe"] },
            __EXACT__: define({ modes: ["fast", "safe"] }, { exact: true }),
            __VERSION__: define("1.2.3", {
              type: "`${number}.${number}.${number}`",
            }),
          },
        },
      })};`,
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          paths: { "@scope/package": ["./src/index.ts"] },
        },
        include: ["src", "env.d.ts"],
      }),
      "src/index.ts": [
        "export const name = __NAME__;",
        "export const options = __OPTIONS__;",
        "export const exact = __EXACT__;",
        "export function version() { return __VERSION__; }",
      ].join("\n"),
    });

    const config = await loadConfig(project.root);

    await syncEnvFile(config);

    await config.context.filesystem.flush();

    await build({
      ...(await createTsdownConfig(config, { ci: false })),
      config: false,
      logLevel: "silent",
    });

    const declarations = project
      .read("dist/index.d.mts")
      .replaceAll(/\s+/g, " ");

    expect(declarations).toContain("declare const name: string;");
    expect(declarations).toContain("retries: number;");
    expect(declarations).toContain("modes: string[];");

    expect(declarations).toContain(
      'readonly modes: readonly ["fast", "safe"];',
    );

    expect(declarations).toContain(
      "declare function version(): `${number}.${number}.${number}`;",
    );

    expect(declarations).not.toContain("any");
  });

  test("declares the namespace of an empty module entry", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" } };\n',
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          paths: {
            "@scope/package/*": ["./src/*/index.ts"],
            "@scope/package": ["./src/index.ts"],
          },
        },
        include: ["src"],
      }),
      "src/index.ts": [
        'export * as empty from "./empty/index.ts";',
        'export * as filled from "./filled/index.ts";',
      ].join("\n"),
      "src/empty/index.ts": "export {};\n",
      "src/filled/index.ts": "export const value = 1;\n",
    });

    const config = await loadConfig(project.root);

    await build({
      ...(await createTsdownConfig(config, { ci: false })),
      config: false,
      failOnWarn: true,
      logLevel: "silent",
    });

    const program = createProgram([project.resolve("dist/index.d.mts")], {
      noEmit: true,
      strict: true,
    });

    expect(getPreEmitDiagnostics(program)).toEqual([]);
  });

  test("builds entries from the tsconfig paths and wires the project options", async () => {
    const config = await loadConfig(root);

    const tsdownConfig = createTsdownConfig(
      config,
      {
        ci: true,
      },
      {
        bundle: ["@auaust/toolkit"],
      },
    );

    expect(await tsdownConfig).toMatchObject({
      cwd: config.context.root,
      entry: {
        "index": "src/index.ts",
        "alpha/index": "src/alpha/index.ts",
        "bin/cli": "bin/cli/index.ts",
      },
      format: "esm",
      outDir: "dist",
      clean: true,
      exports: {
        exclude: ["bin/cli"],
      },
      deps: {
        onlyBundle: ["@auaust/toolkit"],
      },
      failOnWarn: true,
      minify: true,
      publint: false,
      attw: {
        enabled: false,
      },
    });
  });

  test("enables publint and attw when the project depends on them", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" } };\n',
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
        devDependencies: {
          "@arethetypeswrong/core": "^0.18.0",
          "publint": "^0.3.0",
        },
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
          paths: {
            "@scope/package": ["./src/index.ts"],
          },
        },
      }),
      "src/index.ts": "export {};\n",
    });

    const config = await loadConfig(project.root);

    expect(
      await createTsdownConfig(config, {
        ci: false,
      }),
    ).toMatchObject({
      publint: true,
      attw: {
        enabled: true,
      },
    });
  });

  test("takes the output directory and its cleaning from the engrenage config over the tsconfig", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" }, build: { outDir: "build", clean: false } };\n',
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
          paths: {
            "@scope/package": ["./src/index.ts"],
          },
        },
      }),
      "src/index.ts": "export {};\n",
    });

    const config = await loadConfig(project.root);

    expect(
      await createTsdownConfig(config, {
        ci: false,
      }),
    ).toMatchObject({
      outDir: "build",
      clean: false,
    });
  });

  test("rejects two bin files that build the same entry", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" } };\n',
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
          paths: {
            "@scope/package": ["./src/index.ts"],
          },
        },
      }),
      "src/index.ts": "export {};\n",
      "bin/cli.ts": "export {};\n",
      "bin/cli/index.ts": "export {};\n",
    });

    const config = await loadConfig(project.root);

    await expect(() => {
      return createTsdownConfig(config, {
        ci: false,
      });
    }).rejects.toThrow("Bin entry 'bin/cli' is declared by both");
  });

  test("rejects a package that is not an ES module", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" } };\n',
      "package.json": '{ "name": "@scope/package" }',
    });

    const config = await loadConfig(project.root);

    await expect(() => {
      return createTsdownConfig(config, {
        ci: false,
      });
    }).rejects.toThrow('must declare "type": "module"');
  });

  describe("exposed files", () => {
    function createProject(config: object, files: Record<string, string> = {}) {
      return createTemporaryProject({
        "package.json": JSON.stringify({
          name: "@scope/package",
          type: "module",
        }),
        "engrenage.config.ts": `export default ${JSON.stringify(withSourceRuntime({ ...config }))};\n`,
        "tsconfig.json": JSON.stringify({
          compilerOptions: {
            outDir: "dist",
            paths: {
              "@scope/package": ["./src/index.ts"],
              "@scope/package/*": ["./src/*/index.ts"],
            },
          },
        }),
        "src/index.ts": "export {};\n",
        "src/alpha/index.ts": "export {};\n",
        "src/alpha/constants.ts": "export {};\n",
        ...files,
      });
    }

    test("builds the same entries from src.exports as from the equivalent paths", async () => {
      const project = createProject({
        src: {
          exports: { ".": "src/index.ts", "./*": "src/*/index.ts" },
        },
      });

      const fromExports = createTsdownConfig(await loadConfig(project.root), {
        ci: false,
      });

      const fromPaths = createTsdownConfig(
        await loadConfig(createProject({}).root),
        { ci: false },
      );

      expect((await fromExports).entry).toEqual({
        "index": "src/index.ts",
        "alpha/index": "src/alpha/index.ts",
      });

      expect((await fromExports).entry).toEqual((await fromPaths).entry);
    });

    test("restricts the entries to src.exports when declared", async () => {
      const project = createProject({
        src: {
          exports: {
            ".": "src/index.ts",
            "./alpha/constants": "src/alpha/constants.ts",
          },
        },
      });

      expect(
        (
          await createTsdownConfig(await loadConfig(project.root), {
            ci: false,
          })
        ).entry,
      ).toEqual({
        "index": "src/index.ts",
        "alpha/constants": "src/alpha/constants.ts",
      });
    });

    test("builds the commands from bin.commands", async () => {
      const project = createProject(
        {
          bin: {
            commands: { tool: "bin/tool/index.ts" },
          },
        },
        {
          "bin/tool/index.ts": "export {};\n",
          "bin/other.ts": "export {};\n",
        },
      );

      expect(
        await createTsdownConfig(await loadConfig(project.root), {
          ci: false,
        }),
      ).toMatchObject({
        entry: { "bin/tool": "bin/tool/index.ts" },
        exports: { exclude: ["bin/tool"] },
      });
    });

    test("passes data.exports to tsdown's custom exports", async () => {
      const project = createProject({
        data: {
          exports: { "./presets/*.json": "data/presets/*.json" },
        },
      });

      expect(
        await createTsdownConfig(await loadConfig(project.root), {
          ci: false,
        }),
      ).toMatchObject({
        exports: {
          customExports: { "./presets/*.json": "./data/presets/*.json" },
        },
      });
    });

    test("rejects a subpath exposed by both src and data", async () => {
      const project = createProject({
        data: {
          exports: { "./alpha": "data/alpha.json" },
        },
      });

      const config = await loadConfig(project.root);

      await expect(() => {
        return createTsdownConfig(config, { ci: false });
      }).rejects.toThrow(
        /Subpath '\.\/alpha' is exposed by both src .* and data\.exports/,
      );
    });
  });

  describe("target", () => {
    function createProject(config: object, engines?: object) {
      return createTemporaryProject({
        "package.json": JSON.stringify({
          name: "@scope/package",
          type: "module",
          ...(engines === undefined ? {} : { engines }),
        }),
        "engrenage.config.ts": `export default ${JSON.stringify(withSourceRuntime({ ...config }))};\n`,
        "tsconfig.json": JSON.stringify({
          compilerOptions: {
            outDir: "dist",
            paths: { "@scope/package": ["./src/index.ts"] },
          },
        }),
        "src/index.ts": "export {};\n",
      });
    }

    test("targets the browsers and the Node minimum of the baseline", async () => {
      const project = createProject({
        src: { baseline: "2026-10" },
      });

      expect(
        (
          await createTsdownConfig(await loadConfig(project.root), {
            ci: false,
          })
        ).target,
      ).toEqual([
        "chrome123",
        "edge123",
        "firefox124",
        "safari17.4",
        "ios17.4",
        "node22",
      ]);
    });

    test("targets the Node major of src.node", async () => {
      const project = createProject({
        src: { node: 24 },
      });

      expect(
        (
          await createTsdownConfig(await loadConfig(project.root), {
            ci: false,
          })
        ).target,
      ).toEqual(["node24"]);
    });

    test("ignores engines.node", async () => {
      const config = {
        src: { node: 24 },
      };

      const withEngines = createProject(config, { node: ">=18" });
      const without = createProject(config);

      expect(
        (
          await createTsdownConfig(await loadConfig(withEngines.root), {
            ci: false,
          })
        ).target,
      ).toEqual(
        (
          await createTsdownConfig(await loadConfig(without.root), {
            ci: false,
          })
        ).target,
      );
    });
  });

  test("builds declarations with the src tsconfig on a solution base", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" } };\n',
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          paths: { "@scope/package": ["./src/index.ts"] },
        },
        files: [],
        references: [{ path: "./tsconfig.src.json" }],
      }),
      "tsconfig.src.json": JSON.stringify({
        extends: "./tsconfig.json",
        compilerOptions: { composite: true },
        include: ["src"],
      }),
      "src/index.ts": "export const value = 1;\n",
    });

    const config = await loadConfig(project.root);

    const tsdownConfig = createTsdownConfig(config, {
      ci: false,
    });

    expect((await tsdownConfig).tsconfig).toBe(
      project.resolve("tsconfig.json"),
    );

    expect((await tsdownConfig).dts).toMatchObject({
      tsconfig: project.resolve("tsconfig.src.json"),
    });

    await build({
      ...(await tsdownConfig),
      config: false,
      logLevel: "silent",
    });

    expect(project.read("dist/index.d.mts")).toContain(
      "declare const value = 1;",
    );
  });

  test("leaves the declarations tsconfig unset without a src tsconfig", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
      }),
      "engrenage.config.ts": `export default ${JSON.stringify(
        withSourceRuntime({
          src: { tsconfig: false },
        }),
      )};`,
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
          module: "ESNext",
          moduleResolution: "Bundler",
          strict: true,
          paths: { "@scope/package": ["./src/index.ts"] },
        },
        include: ["src"],
      }),
      "src/index.ts": "export const value = 1;\n",
    });

    const config = await loadConfig(project.root);

    const tsdownConfig = createTsdownConfig(config, {
      ci: false,
    });

    expect((await tsdownConfig).dts).not.toHaveProperty("tsconfig");

    await build({
      ...(await tsdownConfig),
      config: false,
      logLevel: "silent",
    });

    expect(project.read("dist/index.d.mts")).toContain(
      "declare const value = 1;",
    );
  });
});

describe("createTsdownConfig plugins", () => {
  function pluginNames(plugins: unknown): string[] {
    return (plugins as { name: string }[]).map(({ name }) => name);
  }

  test("lists the empty-namespaces plugins by default and omits them when switched off", async () => {
    const config = await loadConfig(root);

    expect(
      pluginNames((await createTsdownConfig(config, { ci: false })).plugins),
    ).toEqual([
      "engrenage:empty-namespaces:find",
      "engrenage:empty-namespaces:declare",
      "engrenage:entry-self-references",
    ]);

    expect(
      (
        await createTsdownConfig(
          config,
          {
            ci: false,
          },
          {
            plugins: {
              "empty-namespaces": false,
              "entry-self-references": false,
            },
          },
        )
      ).plugins,
    ).toEqual([]);
  });

  test("rejects an unknown plugin name with the known names", async () => {
    const config = await loadConfig(root);

    await expect(() => {
      return createTsdownConfig(config, { ci: false }, {
        plugins: { unknown: false },
      } as never);
    }).rejects.toThrow(/empty-namespaces/);
  });
});
