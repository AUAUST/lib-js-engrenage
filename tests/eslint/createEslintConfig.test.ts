import { ESLint } from "eslint";
import { describe, expect, expectTypeOf, test } from "vitest";

import {
  loadConfig,
  type Environment,
  type Presets,
  type ResolvedConfig,
} from "@auaust/engrenage/config";
import {
  createEslintConfig,
  type Config,
  type Options,
} from "@auaust/engrenage/eslint";
import { map } from "@auaust/primitive-kit/arrays";
import type { Maybe } from "@auaust/toolkit/types";

import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("eslint");

async function createLinter(options?: Options) {
  return new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: createEslintConfig(await loadConfig(root), options),
  });
}

const performanceSource = `import * as v from "valibot";
import { string } from "zod";
import z, { z as zod } from "zod/mini";

import { identity } from "@auaust/toolkit";
import { map } from "@auaust/toolkit/object";

export * as valibot from "valibot";
export { object } from "zod/mini";

export const values = [identity, map, v.string, string, z.string, zod.string];
`;

async function lintedPerformanceRules(
  {
    presets,
    environment,
  }: {
    presets: Presets;
    environment?: Environment;
  },
  options?: Options,
) {
  const config = await loadConfig(root);

  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: createEslintConfig(
      {
        ...config,
        presets,
        environment: environment ?? config.environment,
      },
      {
        promises: false,
        ...options,
      },
    ),
  });

  const [result] = await eslint.lintText(performanceSource, {
    filePath: "src/performance.ts",
  });

  return map(result?.messages ?? [], (message) => message.ruleId);
}

async function lintedRules(file: string, options?: Options) {
  const eslint = await createLinter(options);

  const [result] = await eslint.lintFiles([file]);

  return map(result?.messages ?? [], (message) => message.ruleId);
}

const misorderedPackageJson = `{
  "version": "1.0.0",
  "name": "@fixture/misordered",
  "dependencies": {
    "zod": "^4.0.0",
    "valibot": "^1.0.0"
  }
}
`;

async function lintedPackageJsonRules(options?: Options) {
  const eslint = await createLinter(options);

  const [result] = await eslint.lintText(misorderedPackageJson, {
    filePath: "package.json",
  });

  return map(result?.messages ?? [], (message) => message.ruleId);
}

describe("createEslintConfig", () => {
  test("reports the shared conventions in source files", async () => {
    const rules = await lintedRules("src/violations.ts");

    expect(rules).toEqual(
      expect.arrayContaining(["curly", "eqeqeq", "import-x/no-default-export"]),
    );
    expect(rules.filter((rule) => rule === "eqeqeq")).toHaveLength(1);
  });

  test("reports misordered and unused imports", async () => {
    expect(await lintedRules("src/imports.ts")).toEqual([
      "perfectionist/sort-named-imports",
      "perfectionist/sort-imports",
      "perfectionist/sort-imports",
      "unused-imports/no-unused-imports",
    ]);
  });

  test("reports each restriction under its own rule, in every syntactic form", async () => {
    expect(await lintedRules("src/restricted.ts")).toEqual([
      "auaust/no-array-is-array",
      "auaust/no-runtime-typeof",
      "auaust/no-array-is-array",
      "auaust/no-array-is-array",
    ]);
  });

  test("turns off single conventions and whole categories", async () => {
    expect(
      await lintedRules("src/restricted.ts", {
        comparisons: {
          noRuntimeTypeof: false,
        },
      }),
    ).not.toContain("auaust/no-runtime-typeof");

    expect(
      await lintedRules("src/restricted.ts", {
        globals: false,
      }),
    ).toEqual(["auaust/no-runtime-typeof"]);
  });

  test("enables the performance conventions with the library preset", async () => {
    expect(
      await lintedPerformanceRules({
        presets: [],
      }),
    ).toEqual([]);

    expect(
      await lintedPerformanceRules({
        presets: ["library"],
      }),
    ).toEqual([
      "auaust/no-valibot-namespace",
      "auaust/no-zod-classic",
      "auaust/no-zod-namespace",
      "auaust/no-zod-namespace",
      "auaust/no-toolkit-root",
      "auaust/no-valibot-namespace",
    ]);
  });

  test("lets options override the conventions of presets", async () => {
    expect(
      await lintedPerformanceRules(
        {
          presets: ["library"],
        },
        {
          performance: false,
        },
      ),
    ).toEqual([]);

    expect(
      await lintedPerformanceRules(
        {
          presets: [],
        },
        {
          performance: {
            noZodClassic: true,
          },
        },
      ),
    ).toEqual(["auaust/no-zod-classic"]);
  });

  test("enables dependency-gated conventions only for declared packages, unless options force them", async () => {
    const valibotOnly: Environment = {
      has(name) {
        return name === "valibot";
      },
    };

    expect(
      await lintedPerformanceRules({
        presets: ["library"],
        environment: valibotOnly,
      }),
    ).toEqual(["auaust/no-valibot-namespace", "auaust/no-valibot-namespace"]);

    expect(
      await lintedPerformanceRules(
        {
          presets: ["library"],
          environment: valibotOnly,
        },
        {
          performance: {
            noZodClassic: true,
          },
        },
      ),
    ).toEqual([
      "auaust/no-valibot-namespace",
      "auaust/no-zod-classic",
      "auaust/no-valibot-namespace",
    ]);
  });

  test("reports test files outside the test directories", async () => {
    expect(await lintedRules("src/misplaced.test.ts")).toEqual([
      "auaust/no-misplaced-tests",
    ]);

    expect(await lintedRules("tests/placed.test.ts")).toEqual([]);
  });

  test("reports misordered package.json properties and collections, unless disabled", async () => {
    expect(await lintedPackageJsonRules()).toEqual([
      "package-json/order-properties",
      "package-json/sort-collections",
    ]);

    expect(
      await lintedPackageJsonRules({
        packageJson: false,
      }),
    ).not.toContain("package-json/order-properties");
  });

  test("allows default exports in tool configs", async () => {
    expect(await lintedRules("tool.config.ts")).toEqual([]);
  });

  test("ignores gitignored and generated files", async () => {
    const eslint = await createLinter();

    expect(await eslint.isPathIgnored("ignored.ts")).toBe(true);
    expect(await eslint.isPathIgnored("coverage/report.ts")).toBe(true);
    expect(await eslint.isPathIgnored("tests/unit/fixtures/case.ts")).toBe(
      true,
    );
    expect(await eslint.isPathIgnored("src/violations.ts")).toBe(false);

    const unignored = await createLinter({
      ignore: false,
    });

    expect(await unignored.isPathIgnored("ignored.ts")).toBe(false);
  });

  test("ignores fixtures through the global files.fixtures glob", async () => {
    const config = await loadConfig(root);

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig({
        ...config,
        files: {
          ...config.files,
          fixtures: "**/data/**",
        },
      }),
    });

    expect(await eslint.isPathIgnored("tests/unit/data/case.ts")).toBe(true);
    expect(await eslint.isPathIgnored("tests/unit/fixtures/case.ts")).toBe(
      false,
    );
  });

  test("rejects unknown options", async () => {
    const config = await loadConfig(root);

    expect(() => {
      return createEslintConfig(config, {
        comparisons: {
          // @ts-expect-error: unknown convention
          noTypof: false,
        },
      });
    }).toThrow("noTypof");
  });

  test("exposes its contract through the local aliases", () => {
    expectTypeOf(createEslintConfig).parameters.toEqualTypeOf<
      [ResolvedConfig, Maybe<Options>?]
    >();
    expectTypeOf(createEslintConfig).returns.toEqualTypeOf<Config[]>();
  });
});
