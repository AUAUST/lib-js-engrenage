import { describe, expect, test, vi } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createTsdownConfig } from "@auaust/engrenage/tsdown";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("tsdown");

describe("createTsdownConfig", () => {
  test("builds entries from the tsconfig paths and wires the project options", async () => {
    const config = await loadConfig(root);

    const tsdownConfig = createTsdownConfig(
      config,
      {
        ci: true,
      },
      {
        bins: {
          "bin/cli": "bin/cli/index.ts",
        },
        customExports: {
          "./presets/*.json": "./data/presets/*.json",
        },
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
        customExports: {
          "./presets/*.json": "./data/presets/*.json",
        },
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
        'export default { directories: { output: "build" }, build: { emptyOutDir: false } };\n',
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

  test("rejects a bin that shadows a package entry", async () => {
    const config = await loadConfig(root);

    expect(() => {
      return createTsdownConfig(
        config,
        {
          ci: false,
        },
        {
          bins: {
            "alpha/index": "bin/cli/index.ts",
          },
        },
      );
    }).toThrow("Bin entry 'alpha/index' conflicts");
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
});
