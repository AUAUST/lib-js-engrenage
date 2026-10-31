import { build } from "tsdown";
import { createProgram, getPreEmitDiagnostics } from "typescript";
import { describe, expect, test, vi } from "vitest";

import { define, loadConfig } from "@auaust/engrenage/config";
import { createTsdownConfig } from "@auaust/engrenage/tsdown";
import { syncEnvFile } from "@auaust/engrenage/typescript";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("tsdown");

describe("createTsdownConfig", () => {
  test("preserves synced global types in exported declarations", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        name: "@scope/package",
        type: "module",
      }),
      "engrenage.config.ts": `export default ${JSON.stringify({
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

    syncEnvFile(config);

    config.filesystem.flush();

    await build({
      ...createTsdownConfig(config, { ci: false }),
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
      ...createTsdownConfig(config, { ci: false }),
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

    expect(tsdownConfig).toMatchObject({
      cwd: config.root,
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
      createTsdownConfig(config, {
        ci: false,
      }),
    ).toMatchObject({
      publint: true,
      attw: {
        enabled: true,
      },
    });
  });

  test("takes the output directory and its emptying from the engrenage config over the tsconfig", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { build: { outDir: "build", emptyOutDir: false } };\n',
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
      createTsdownConfig(config, {
        ci: false,
      }),
    ).toMatchObject({
      outDir: "build",
      clean: false,
    });
  });

  test("rejects two bin files that build the same entry", async () => {
    const project = createTemporaryProject({
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

    expect(() => {
      return createTsdownConfig(config, {
        ci: false,
      });
    }).toThrow("Bin entry 'bin/cli' is declared by both");
  });

  test("rejects a package that is not an ES module", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const project = createTemporaryProject({
      "package.json": '{ "name": "@scope/package" }',
    });

    const config = await loadConfig(project.root);

    expect(() => {
      return createTsdownConfig(config, {
        ci: false,
      });
    }).toThrow('must declare "type": "module"');
  });

  describe("exposed files", () => {
    function createProject(config: object, files: Record<string, string> = {}) {
      return createTemporaryProject({
        "package.json": JSON.stringify({
          name: "@scope/package",
          type: "module",
        }),
        "engrenage.config.ts": `export default ${JSON.stringify(config)};\n`,
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

      expect(fromExports.entry).toEqual({
        "index": "src/index.ts",
        "alpha/index": "src/alpha/index.ts",
      });

      expect(fromExports.entry).toEqual(fromPaths.entry);
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
        createTsdownConfig(await loadConfig(project.root), { ci: false }).entry,
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
        createTsdownConfig(await loadConfig(project.root), { ci: false }),
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
        createTsdownConfig(await loadConfig(project.root), { ci: false }),
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

      expect(() => {
        return createTsdownConfig(config, { ci: false });
      }).toThrow(
        /Subpath '\.\/alpha' is exposed by both src .* and data\.exports/,
      );
    });
  });
});
