import { loadConfig } from "@auaust/engrenage/config";
import { createTsdownConfig } from "@auaust/engrenage/tsdown";
import { describe, expect, test } from "vitest";

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
        fileExports: {
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
      outDir: "dist",
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
});
