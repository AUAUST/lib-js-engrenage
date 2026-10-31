import { ESLint } from "eslint";
import { format } from "prettier";
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
import { infoRulesSetting } from "@auaust/engrenage/eslint/constants";
import prettierOptions from "@auaust/engrenage/prettier";
import { map } from "@auaust/primitive-kit/arrays";
import { memoized } from "@auaust/toolkit/memoized";
import type { Maybe } from "@auaust/toolkit/types";

import { packageJsonFile } from "#constants";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { getFixture } from "#tests/helpers/getFixture";

const root = getFixture("eslint");

const getLinter = memoized<
  (options?: Options, fix?: boolean) => Promise<ESLint>,
  string
>(
  async function (options?: Options, fix = false) {
    return new ESLint({
      cwd: root,
      fix,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig(await loadConfig(root), options),
    });
  },
  (options, fix = false) => {
    return JSON.stringify({
      options,
      fix,
    });
  },
);

const performanceSource = `import { string } from "zod";
import z, { z as zod } from "zod/mini";

import { identity } from "@auaust/toolkit";
import { map } from "@auaust/toolkit/object";

export { object } from "zod/mini";

export const values = [identity, map, string, z.string, zod.string];
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
        typeAware: false,
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
  const eslint = await getLinter(options);

  const [result] = await eslint.lintFiles([file]);

  return map(result?.messages ?? [], (message) => message.ruleId);
}

const misorderedPackageJson = `{
  "version": "1.0.0",
  "name": "@fixture/misordered",
  "private": true,
  "description": "Misordered fixture.",
  "type": "module",
  "dependencies": {
    "zod": "^4.0.0",
    "valibot": "^1.0.0"
  }
}
`;

const secondaryFieldsFirstPackageJson = `{
  "name": "@fixture/secondary",
  "private": true,
  "description": "Secondary fields fixture.",
  "sideEffects": false,
  "prettier": "@fixture/prettier",
  "type": "module",
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
  "private": true,
  "description": "Secondary fields fixture.",
  "type": "module",
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
  const eslint = await getLinter(options);

  const [result] = await eslint.lintText(content, {
    filePath: packageJsonFile,
  });

  return map(result?.messages ?? [], (message) => message.ruleId);
}

async function lintedProjectRules(source: string) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "project",
      type: "module",
      imports: {
        "#*": "./src/*.ts",
      },
      dependencies: {
        valibot: "*",
      },
    }),
    "engrenage.config.ts": "export default {};\n",
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        allowImportingTsExtensions: true,
        paths: {
          "$lib/*": ["./src/lib/*"],
        },
      },
    }),
    "src/thing.ts": "export const thing = 1;\n",
    "src/things.ts": "export const one = 1;\n",
    "src/other.ts": "export const other = 1;\n",
    "src/manifest.ts": "export default {};\n",
    "src/lib/thing.ts": "export const thing = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  const [result] = await eslint.lintText(source, {
    filePath: "src/index.ts",
  });

  return map(result?.messages ?? [], (message) => message.ruleId);
}

describe("createEslintConfig", () => {
  describe("object newlines", () => {
    test.each([
      [
        "one property",
        "getLinter({ typeAware: false })",
        "getLinter({ typeAware: false })",
      ],
      [
        "two properties",
        "{ first: true, second: false }",
        "{ first: true, second: false }",
      ],
      [
        "existing newlines",
        "{\n typeAware: false,\n}",
        "{\n typeAware: false,\n}",
      ],
      [
        "three properties",
        "{ first: true, second: false, third: true }",
        "{\n first: true, second: false, third: true,\n}",
      ],
      [
        "nested objects",
        "{ value: { nested: true } }",
        "{\n value: { nested: true },\n}",
      ],
      [
        "existing nested newlines",
        "{\n value: {\n nested: true,\n },\n}",
        "{\n value: {\n nested: true,\n },\n}",
      ],
      [
        "inline arguments",
        "run({ first: true }, { second: false })",
        "run({ first: true }, { second: false })",
      ],
      [
        "multiline arguments",
        "run({ presets: [] }, {\n performance: { noZodClassic: true },\n})",
        "run({\n presets: [],\n}, {\n performance: { noZodClassic: true },\n})",
      ],
      [
        "three-property sibling",
        "[{ short: true }, { a: 1, b: 2, c: 3 }]",
        "[{\n short: true,\n}, {\n a: 1, b: 2, c: 3,\n}]",
      ],
      [
        "nested arrays",
        "[[{ short: true }, true], [{\n other: false,\n}, false]]",
        "[[{\n short: true,\n}, true], [{\n other: false,\n}, false]]",
      ],
      [
        "constructor arguments",
        "new Config({ first: true }, {\n second: false,\n})",
        "new Config({\n first: true,\n}, {\n second: false,\n})",
      ],
      [
        "unrelated calls",
        "[first({ short: true }), second({\n other: false,\n})]",
        "[first({ short: true }), second({\n other: false,\n})]",
      ],
      [
        "empty objects",
        "run({}, {\n enabled: true,\n})",
        "run({}, {\n enabled: true,\n})",
      ],
      [
        "Prettier wrapping",
        'run({ short: true }, { longProperty: "a deliberately long value that forces the object to wrap beyond the configured print width" })',
        'run({\n short: true,\n}, {\n longProperty: "a deliberately long value that forces the object to wrap beyond the configured print width",\n})',
      ],
    ])("%s", async (_name, input, expected) => {
      const eslint = await getLinter({ typeAware: false }, true);

      const options = { ...prettierOptions, parser: "typescript" };

      const source = await format(`export const result = ${input};`, options);

      const [result] = await eslint.lintText(source, {
        filePath: "src/objects.ts",
      });

      const output = await format(result?.output ?? source, options);

      expect(output).toBe(
        await format(`export const result = ${expected};`, options),
      );

      const [repeated] = await eslint.lintText(output, {
        filePath: "src/objects.ts",
      });

      expect(await format(repeated?.output ?? output, options)).toBe(output);

      expect(
        repeated?.messages.filter(
          (message) => message.ruleId === "auaust/object-curly-newline",
        ),
      ).toEqual([]);
    });
  });

  test.each([
    [{ typeAware: true }, true],
    [{ typeAware: false }, false],
    [{ recommended: false }, false],
  ])("enables typed recommended rules with %j", async (options, enabled) => {
    const eslint = await getLinter(options);

    const [result] = await eslint.lintText(
      "export const values = [1];\ndelete values[0];\n",
      {
        filePath: "src/unions.ts",
      },
    );

    const rules = map(result?.messages ?? [], (message) => message.ruleId);

    expect(rules.includes("@typescript-eslint/no-array-delete")).toBe(enabled);

    expect(result?.fatalErrorCount).toBe(0);
  });

  test.each([
    ["src/example.ts", true],
    ["bin/example.ts", true],
    ["scripts/example.ts", true],
    ["tests/example.test.ts", true],
    ["tool.config.ts", false],
    ["package.json", false],
  ])("scopes typed recommended rules in %s", async (filePath, enabled) => {
    const eslint = await getLinter();

    const config = (await eslint.calculateConfigForFile(filePath)) as
      Config | undefined;

    expect(config?.rules?.["@typescript-eslint/no-array-delete"]).toEqual(
      enabled ? [2] : undefined,
    );

    if (!enabled) {
      return;
    }

    expect(config?.rules?.["@typescript-eslint/no-unsafe-assignment"]).toEqual([
      0,
    ]);

    expect(
      config?.rules?.["@typescript-eslint/no-unsafe-member-access"],
    ).toEqual([0]);

    expect(config?.languageOptions?.parserOptions).toMatchObject({
      projectService: true,
    });
  });

  test("reports the shared conventions in source files", async () => {
    const rules = await lintedRules("src/violations.ts");

    expect(rules).toEqual(
      expect.arrayContaining([
        "auaust/curly",
        "auaust/no-loose-equal",
        "auaust/no-default-export",
      ]),
    );

    expect(
      rules.filter((rule) => rule === "auaust/no-loose-equal"),
    ).toHaveLength(1);
  });

  test("reports misordered and unused imports", async () => {
    expect(
      await lintedRules("src/imports.ts", {
        typeAware: false,
      }),
    ).toEqual([
      "auaust/sort-named-imports",
      "auaust/sort-imports",
      "auaust/sort-imports",
      "auaust/no-unused-imports",
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
        typeAware: false,
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

  test("groups project namespace and default imports and exports last, unless a comment splits them", async () => {
    expect(
      await lintedProjectRules(`import { string } from "valibot";

import { thing } from "#thing";

import * as things from "#things";

import manifest from "#manifest";

// Partition
import { other } from "#other";

export * as registry from "#things";
export { thing as alias } from "#thing";

export const values = [string, thing, things, manifest, other];
`),
    ).toEqual(["auaust/sort-exports"]);

    expect(
      await lintedProjectRules(`import * as things from "#things";
import manifest from "#manifest";
import { thing } from "#thing";

export const values = [things, manifest, thing];
`),
    ).toEqual(["auaust/sort-imports", "auaust/sort-imports"]);
  });

  test("reports namespace imports and exports of dependencies, but not of project modules", async () => {
    expect(
      await lintedProjectRules(`import * as path from "node:path";

import * as v from "valibot";

import * as things from "#things";
import * as alias from "$lib/thing";

export * as valibot from "valibot";
export * from "valibot";

export const values = [path, v, things, alias];
`),
    ).toEqual([
      "auaust/no-external-namespace",
      "auaust/no-external-namespace",
      "auaust/no-external-namespace",
    ]);
  });

  test("reports each restriction under its own rule, in every syntactic form", async () => {
    expect(await lintedRules("src/restricted.ts")).toEqual([
      "auaust/no-array-is-array",
      "auaust/no-runtime-typeof",
      "auaust/no-array-is-array",
      "auaust/no-array-is-array",
      "auaust/no-typeof-undefined",
    ]);
  });

  test("reports the Math functions toolkit replaces, but not the constants", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `const { max } = Math;

export const values = [Math.floor(1.5), Math["round"](2.5), Math.PI, max];
`,
      {
        filePath: "src/math.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual([
      "1:auaust/no-math-statics",
      "3:auaust/no-math-statics",
      "3:auaust/no-math-statics",
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
    ).toEqual(["auaust/no-runtime-typeof", "auaust/no-typeof-undefined"]);
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
      "auaust/no-zod-classic",
      "auaust/no-zod-namespace",
      "auaust/no-zod-namespace",
      "auaust/no-toolkit-root",
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
    const zodOnly: Environment = {
      hasDependency(name): name is "zod" {
        return name === "zod";
      },
    };

    expect(
      await lintedPerformanceRules({
        presets: ["library"],
        environment: zodOnly,
      }),
    ).toEqual([
      "auaust/no-zod-classic",
      "auaust/no-zod-namespace",
      "auaust/no-zod-namespace",
    ]);

    expect(
      await lintedPerformanceRules(
        {
          presets: ["library"],
          environment: zodOnly,
        },
        {
          performance: {
            noToolkitRoot: true,
          },
        },
      ),
    ).toEqual([
      "auaust/no-zod-classic",
      "auaust/no-zod-namespace",
      "auaust/no-zod-namespace",
      "auaust/no-toolkit-root",
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
    const eslint = await getLinter(
      {
        typeAware: false,
      },
      true,
    );

    const shared = `
  if (chance()) {
    log("kept");
    log("too");

    return;
  }

  if (chance()) {
    log("commented");
    // keep this note

    return;
  }

  await task();
}
`;

    const source = `export const state = {
  count: 0,
};

export async function run(task: () => Promise<void>, log: (text: string) => void, chance: () => boolean) {
  if (chance()) {
    await task();

    return;
  }

  if (chance()) {
    state.count = 1;

    return;
  }

  if (chance()) {
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

    const fixed = `export const state = {
  count: 0,
};

export async function run(task: () => Promise<void>, log: (text: string) => void, chance: () => boolean) {
  if (chance()) {
    return void (await task());
  }

  if (chance()) {
    return void (state.count = 1);
  }

  if (chance()) {
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

    expect(result?.output).toBeDefined();

    const options = { ...prettierOptions, parser: "typescript" };

    expect(await format(result?.output ?? source, options)).toBe(
      await format(fixed, options),
    );

    expect(map(result?.messages ?? [], (message) => message.ruleId)).toEqual([
      "auaust/prefer-return-void",
    ]);
  });

  test("reports each layout convention under its own rule", async () => {
    const source = `type Value = string;
export function pick(value: Value): number;

export function pick(value: Value): number {
  switch (value) {

    case "a":
      return 1;
    case "b":
    case "c": {
      return 2;
    }

    default: {
      return 3;
    }
  }
}
`;

    async function lintedLayoutRules(options?: Options) {
      const eslint = await getLinter({
        typeAware: false,
        ...options,
      });

      const [result] = await eslint.lintText(source, {
        filePath: "src/layout.ts",
      });

      return map(result?.messages ?? [], (message) => message.ruleId);
    }

    expect(await lintedLayoutRules()).toEqual([
      "auaust/padded-blocks",
      "auaust/padded-exports",
      "auaust/grouped-overloads",
      "auaust/unpadded-switches",
      "auaust/switch-case-braces",
      "auaust/padded-cases",
    ]);

    expect(
      await lintedLayoutRules({
        stylistic: {
          paddedBlocks: false,
          switches: false,
        },
      }),
    ).toEqual([
      "auaust/padded-exports",
      "auaust/grouped-overloads",
      "auaust/unpadded-switches",
      "auaust/padded-cases",
    ]);
  });

  test.each([
    ["let foo;\nlet bar;", 0],
    ["const foo = 1;\nconst bar = 2;", 0],
    ["let foo;\nconst bar = 1;", 1],
    ["const foo = 1;\nlet bar;", 1],
    ["const bar = {};\nbar.foo();", 1],
    ["let bar;\nbar = 1;", 1],
    ["syncClaudeSettings(config);\nconst content = read();", 1],
    ["run();\nlet value;", 1],
    ["run();\n\nconst value = 1;", 0],
    ["function run() {\nconst value = 1;\n}", 0],
    ["function run() {\nlet value;\n}", 0],
    ["let foo;\n\nconst bar = 1;", 0],
    ["let foo; // trailing comment\nconst bar = 1;", 1],
    ["for (let index = 0; index < 2; index++) {}", 0],
  ])("pads variable declaration groups in %s", async (source, count) => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(source, {
      filePath: "src/declarations.ts",
    });

    const messages = (result?.messages ?? []).filter((message) => {
      return message.ruleId === "auaust/padded-variable-declarations";
    });

    expect(messages).toHaveLength(count);

    for (const message of messages) {
      expect(message.fix?.text).toBe("\n");
    }
  });

  test("wraps case statements in a block, declarations included", async () => {
    const eslint = await getLinter(
      {
        typeAware: false,
      },
      true,
    );

    const source = `export function pick(value: string): number {
  switch (value) {
    case "a":
      return 1;

    default:
      const fallback = 2;

      return fallback;
  }
}
`;

    const [result] = await eslint.lintText(source, {
      filePath: "src/cases.ts",
    });

    expect(result?.output).toBe(`export function pick(value: string): number {
  switch (value) {
    case "a": {
      return 1;
    }

    default: {
      const fallback = 2;

      return fallback;
    }
  }
}
`);

    expect(map(result?.messages ?? [], (message) => message.ruleId)).toEqual(
      [],
    );
  });

  test("exposes delegated rules whose options projects override key by key", async () => {
    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: [
        ...createEslintConfig(await loadConfig(root), {
          typeAware: false,
        }),
        {
          rules: {
            "auaust/name-replacements": [
              "error",
              {
                replacements: {
                  err: false,
                },
              },
            ],
          },
        },
      ],
    });

    const [result] = await eslint.lintText(
      "export const env = 1;\n\nexport const err = 2;\n\nexport const e = 3;\n",
      {
        filePath: "src/names.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["5:auaust/name-replacements"]);
  });

  test("allows standalone void statements and discarded returned actions", async () => {
    const eslint = await getLinter({
      recommended: false,
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `declare function call(): void;

declare const value: number;

export function discard() {
  void call();
}

export function inert() {
  return void value;
}

export function returned() {
  return void call();
}

export const handlers = [() => void call()];

declare function refresh(): Promise<void>;

declare const pendingRefresh: Promise<void>;

void refresh();

void pendingRefresh;

export const discarded = void call();
`,
      {
        filePath: "src/voids.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["10:auaust/void-placement", "27:auaust/void-placement"]);
  });

  test("allows concise arrows returning simple arrays or const literals", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `declare function call(): number;

export const literal = () => "computed" as const;
export const wrapped = (value: number) => [value];
export const asserted = (value: number) => [value, 1] as const;
export const computed = (value: number) => [call(), value];
export const widened = () => "computed" as string;
`,
      {
        filePath: "src/arrows.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual([
      "6:auaust/no-complex-concise-arrows",
      "7:auaust/no-complex-concise-arrows",
    ]);
  });

  test("allows object literal assertions while enforcing as syntax", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `export const empty = {} as { a: number; b: number };

export const partial = {
  a: 1,
} as { a: number; b: number };

export const complete = {
  a: 1,
  b: 2,
} as { a: number; b: number };

export const angled = <{ a: number; b: number }>{
  a: 1,
};
`,
      {
        filePath: "src/assertions.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["12:auaust/consistent-type-assertions"]);
  });

  test("allows constant conditions, void arguments and await members in test files", async () => {
    const source = `declare const value: Promise<{ length: number }>;
declare function nothing(): void;
declare function check(input: unknown): void;

export async function run(): Promise<number> {
  if (true) {
    check(nothing());
  }

  return (await value).length;
}
`;

    const project = createTemporaryProject({
      "package.json": '{ "name": "tests", "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          strict: true,
          module: "nodenext",
          target: "esnext",
        },
        include: ["src", "tests"],
      }),
      "src/run.ts": source,
      "tests/run.test.ts": source,
    });

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig(await loadConfig(project.root)),
    });

    const results = await eslint.lintFiles(["src/run.ts", "tests/run.test.ts"]);

    const relaxedRules = new Set<Maybe<string>>([
      "no-constant-condition",
      "auaust/no-confusing-void-expression",
      "auaust/no-await-expression-member",
    ]);

    expect(
      map(results, ({ messages }) => {
        return map(
          messages.filter(({ ruleId }) => relaxedRules.has(ruleId)),
          (message) => {
            return `${message.line}:${message.ruleId}`;
          },
        );
      }),
    ).toEqual([
      [
        "6:no-constant-condition",
        "7:auaust/no-confusing-void-expression",
        "10:auaust/no-await-expression-member",
      ],
      [],
    ]);
  });

  test("pads cases once a case body spans several lines or a case is padded", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `export function inline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      return 2;
    }
  }
}

export function multiline(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }
    default: {
      const doubled = value + value;

      return doubled.length;
    }
  }
}

export function partlyPadded(value: string) {
  switch (value) {
    case "a": {
      return 1;
    }

    case "b": {
      return 2;
    }
    default: {
      return 3;
    }
  }
}
`,
      {
        filePath: "src/cases.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["17:auaust/padded-cases", "34:auaust/padded-cases"]);
  });

  test("quotes all keys or none, leaving shorthand and methods alone", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `const also = true;

export const quoted = {
  "quo:ted": true,
  "also": also,
  method() {
    return also;
  },
  "build:done"() {
    return also;
  },
};

export const mixed = {
  "quo:ted": true,
  plain: also,
};

export const needless = {
  "plain": true,
};

export const longform = {
  also: also,
};
`,
      {
        filePath: "src/objects.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual([
      "16:auaust/quote-props",
      "20:auaust/quote-props",
      "24:auaust/object-shorthand",
    ]);
  });

  test("reports literals widened in the union itself, but not through a referenced type", async () => {
    const eslint = await getLinter();

    const [result] = await eslint.lintFiles(["src/unions.ts"]);

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["3:auaust/no-redundant-types"]);
  });

  test("allows type parameters used only in the return type, but not elsewhere", async () => {
    const eslint = await getLinter();

    const [result] = await eslint.lintFiles(["src/typeParameters.ts"]);

    const messages = (result?.messages ?? []).filter((message) => {
      return message.ruleId === "auaust/no-unnecessary-type-parameters";
    });

    expect(
      map(messages, (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual([
      "7:auaust/no-unnecessary-type-parameters",
      "11:auaust/no-unnecessary-type-parameters",
    ]);
  });

  test("lints info rules as warnings and records them in the settings", async () => {
    const configs = createEslintConfig(await loadConfig(root), {
      ignore: false,
    });

    const naming = configs.find((config) => {
      return config.rules?.["auaust/naming-convention"] !== undefined;
    });

    expect(naming?.rules?.["auaust/naming-convention"]).toBe("warn");

    expect(naming?.settings?.[infoRulesSetting]).toEqual([
      "auaust/naming-convention",
    ]);
  });

  test("allows unused parameters named to mark intent", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `export function handle(ignored: unknown, unusedEvent: unknown, _index: number) {
  return 1;
}

export function report(value: unknown, unusual: unknown) {
  return value;
}
`,
      {
        filePath: "src/unused.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["5:auaust/no-unused-vars"]);
  });

  test("reports builtin imports without node: and undashed text encodings", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `import { readFileSync } from "fs";

export const content = readFileSync("file.txt", "utf-8");

export const decoder = new TextDecoder("UTF8");
`,
      {
        filePath: "src/encoding.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual([
      "1:auaust/prefer-node-protocol",
      "5:auaust/text-encoding-identifier-case",
    ]);
  });

  test("allows __DUNDER__ variables but not lowercase ones", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `export const __APP_VERSION__ = "1.0.0";

export const __dunder__ = true;
`,
      {
        filePath: "src/dunder.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["3:auaust/naming-convention"]);
  });

  test("renames names to the expected case with their references", async () => {
    const eslint = await getLinter(
      {
        typeAware: false,
      },
      true,
    );

    const [result] = await eslint.lintText(
      `type item_shape = Record<string, number>;

const MAX_SIZE = 2;

const user_count = MAX_SIZE;

const userCount = 1;

const local_total = MAX_SIZE * userCount;

export const exported_total = local_total;

export const shape: item_shape = {
  MAX_SIZE,
};

export { local_total, user_count };
`,
      {
        filePath: "src/renamed.ts",
      },
    );

    expect(result?.output).toBe(`type ItemShape = Record<string, number>;

const maxSize = 2;

const user_count = maxSize;

const userCount = 1;

const localTotal = maxSize * userCount;

export const exported_total = localTotal;

export const shape: ItemShape = {
  MAX_SIZE: maxSize,
};

export { localTotal as local_total, user_count };
`);
  });

  test("prefers function declarations unless the variable is typed", async () => {
    const eslint = await getLinter({
      typeAware: false,
    });

    const [result] = await eslint.lintText(
      `type Callback = () => number;

export const untyped = function untyped(): number {
  return 1;
};

export const annotated: Callback = function annotated(): number {
  return 1;
};

export const asserted = function asserted(): number {
  return 1;
} as Callback;
`,
      {
        filePath: "src/functions.ts",
      },
    );

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual(["3:auaust/prefer-function-declaration"]);
  });

  test("awaits possible promises, voids async callbacks and reports misused promises", async () => {
    const source = `declare const maybe: Promise<number> | number;
declare const flag: Promise<boolean>;
declare const listen: (callback: () => void) => void;

export async function run(): Promise<unknown> {
  listen(async () => {
    await maybe;
  });

  const values = await Promise.all([maybe, 1]);

  const plain = await values;

  return flag
    ? {
        ...flag,
        plain,
      }
    : undefined;
}
`;

    const project = createTemporaryProject({
      "package.json": '{ "name": "promises", "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          strict: true,
          module: "nodenext",
          target: "esnext",
        },
        include: ["src"],
      }),
      "src/run.ts": source,
    });

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig(await loadConfig(project.root)),
    });

    const [result] = await eslint.lintFiles(["src/run.ts"]);

    expect(
      map(result?.messages ?? [], (message) => {
        return `${message.line}:${message.ruleId}`;
      }),
    ).toEqual([
      "12:auaust/await-thenable",
      "14:auaust/no-misused-promises",
      "16:auaust/no-misused-promises",
    ]);
  });

  test("allows default exports in tool configs", async () => {
    expect(await lintedRules("tool.config.ts")).toEqual([]);
  });

  test("ignores gitignored and generated files", async () => {
    const eslint = await getLinter();

    expect(await eslint.isPathIgnored("ignored.ts")).toBe(true);
    expect(await eslint.isPathIgnored("coverage/report.ts")).toBe(true);

    expect(await eslint.isPathIgnored("tests/unit/fixtures/case.ts")).toBe(
      true,
    );

    expect(await eslint.isPathIgnored("src/violations.ts")).toBe(false);

    const unignored = await getLinter({
      ignore: false,
    });

    expect(await unignored.isPathIgnored("ignored.ts")).toBe(false);
  });

  test("ignores the resolved tests.fixtures globs", async () => {
    const config = await loadConfig(root);

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: createEslintConfig({
        ...config,
        files: {
          ...config.files,
          fixtures: ["tests/**/data/**"],
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
