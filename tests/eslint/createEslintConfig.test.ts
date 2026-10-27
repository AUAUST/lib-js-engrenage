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

import { packageJsonFile } from "#constants";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
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

const secondaryFieldsFirstPackageJson = `{
  "name": "@fixture/secondary",
  "sideEffects": false,
  "prettier": "@fixture/prettier",
  "scripts": {
    "test": "vitest"
  },
  "dependencies": {
    "valibot": "^1.0.0"
  }
}
`;

const secondaryFieldsLastPackageJson = `{
  "name": "@fixture/secondary",
  "scripts": {
    "test": "vitest"
  },
  "dependencies": {
    "valibot": "^1.0.0"
  },
  "sideEffects": false,
  "prettier": "@fixture/prettier"
}
`;

async function lintedPackageJsonRules(
  options?: Options,
  content = misorderedPackageJson,
) {
  const eslint = await createLinter(options);

  const [result] = await eslint.lintText(content, {
    filePath: packageJsonFile,
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

  test("sorts the project's own tsconfig path aliases with the project imports", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "aliases", "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          module: "nodenext",
          paths: {
            "$lib/*": ["./src/lib/*"],
          },
        },
      }),
      "src/lib/thing.ts": "export const thing = 1;\n",
    });

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig(await loadConfig(project.root), {
        promises: false,
      }),
    });

    const [result] = await eslint.lintText(
      'import { string } from "valibot";\n\nimport { thing } from "$lib/thing";\n\nexport const values = [string, thing];\n',
      {
        filePath: "src/index.ts",
      },
    );

    expect(map(result?.messages ?? [], (message) => message.ruleId)).toEqual(
      [],
    );
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
      hasDependency(name): name is "valibot" {
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

  test("orders secondary package.json fields after scripts and dependencies", async () => {
    expect(
      await lintedPackageJsonRules(undefined, secondaryFieldsFirstPackageJson),
    ).toEqual(["package-json/order-properties"]);

    expect(
      await lintedPackageJsonRules(undefined, secondaryFieldsLastPackageJson),
    ).toEqual([]);
  });

  test("folds a single statement into its bare return and drops useless returns", async () => {
    const eslint = new ESLint({
      cwd: root,
      fix: true,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig(await loadConfig(root), {
        promises: false,
      }),
    });

    const shared = `
  if (Math.random() > 0.5) {
    log("kept");
    log("too");

    return;
  }

  if (Math.random() > 0.5) {
    log("commented");
    // keep this note

    return;
  }

  await task();
}
`;

    const source = `export let count = 0;

export async function run(task: () => Promise<void>, log: (text: string) => void) {
  if (Math.random() > 0.5) {
    await task();

    return;
  }

  if (Math.random() > 0.5) {
    count = 1;

    return;
  }

  if (Math.random() > 0.5) {
    return undefined;
  }
${shared}
export function done(log: () => void) {
  log();

  return;
}

export function tail(ready: boolean, log: () => void) {
  if (ready) {
    log();
    return;
  }
}
`;

    const fixed = `export let count = 0;

export async function run(task: () => Promise<void>, log: (text: string) => void) {
  if (Math.random() > 0.5) {
    return void (await task());
  }

  if (Math.random() > 0.5) {
    return void (count = 1);
  }

  if (Math.random() > 0.5) {
    return;
  }
${shared}
export function done(log: () => void) {
  log();

  
}

export function tail(ready: boolean, log: () => void) {
  if (ready) {
    log();
    
  }
}
`;

    const [result] = await eslint.lintText(source, {
      filePath: "src/returns.ts",
    });

    expect(result?.output).toBe(fixed);
    expect(map(result?.messages ?? [], (message) => message.ruleId)).toEqual([
      "auaust/prefer-return-void",
    ]);
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

  test("ignores the resolved test.fixtureFiles globs", async () => {
    const config = await loadConfig(root);

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig({
        ...config,
        test: {
          ...config.test,
          fixtureFiles: ["tests/**/data/**"],
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
