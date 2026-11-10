import { relative } from "node:path";

import { ESLint } from "eslint";
import { format } from "prettier";
import { describe, expect, expectTypeOf, test } from "vitest";

import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { memoized } from "@auaust/toolkit/memoized";
import { keys } from "@auaust/toolkit/object";
import type { Maybe } from "@auaust/toolkit/types";

import { packageJsonFile } from "#constants";
import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";
import { infoRulesSetting } from "#tools/eslint/constants";
import { createEslintConfig as createConfig } from "#tools/eslint/operations/createEslintConfig";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { ConfigKey } from "#project/config/types/ConfigKey";
import type { ConfigSections } from "#project/config/types/ConfigSections";
import type { Environment } from "#project/config/types/Environment";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { ResolvedTraits } from "#project/presets/types/ResolvedTraits";
import type { Config } from "#tools/eslint/types/Config";
import type { Options } from "#tools/eslint/types/Options";

const root = getFixture("eslint");

const contractsOff = {
  domainContent: false,
  indexDeclarations: false,
  roleContracts: false,
  roleExports: false,
  readonlyConstants: false,
  typeOnlyRoles: false,
};

function overrideSections(
  config: LoadedConfig,
  overrides: ReadonlyMap<ConfigKey, unknown>,
): LoadedConfig {
  function resolve<Key extends ConfigKey>(
    key: Key,
  ): Promise<ConfigSections[Key]>;
  async function resolve(key: ConfigKey): Promise<unknown> {
    return overrides.has(key) ? overrides.get(key) : config.resolve(key);
  }

  return { ...config, resolve };
}

async function createEslintConfig(
  config: LoadedConfig,
  options?: Maybe<Options>,
) {
  return createConfig(config, {
    ...options,
    structure: options?.structure ?? contractsOff,
  });
}

const prettierOptions = await createPrettierConfig(await loadConfig(root));

const getLinter = memoized<
  (options?: Options, fix?: boolean) => Promise<ESLint>,
  string
>(
  async function (options?: Options, fix = false) {
    return new ESLint({
      cwd: root,
      fix,
      overrideConfigFile: true,
      overrideConfig: await createEslintConfig(await loadConfig(root), options),
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
    traits,
    environment,
  }: {
    traits: ResolvedTraits;
    environment?: Environment;
  },
  options?: Options,
) {
  const config = await loadConfig(root);

  const eslint = new ESLint({
    cwd: root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(
      overrideSections(
        config,
        new Map<ConfigKey, unknown>([
          ["traits", traits],
          ["environment", environment ?? (await config.resolve("environment"))],
        ]),
      ),
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

async function lintedProjectRules(
  source: string,
  { filePath = "src/index.ts", engrenageConfig = "export default {};\n" } = {},
) {
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
    "engrenage.config.ts": engrenageConfig,
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
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  const [result] = await eslint.lintText(source, { filePath });

  return map(result?.messages ?? [], (message) => message.ruleId);
}

describe("createEslintConfig", () => {
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
      expect.arrayContaining(["auaust/curly", "auaust/no-loose-equal"]),
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
      overrideConfig: await createEslintConfig(await loadConfig(project.root), {
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

  test("leaves namespace members of TypeScript files to the type checker", async () => {
    expect(
      await lintedProjectRules(`import * as things from "#things";

export const values = [things.two];
`),
    ).toEqual([]);
  });

  test("allows computed access on a namespace import in other code files, but not an unknown name", async () => {
    expect(
      await lintedProjectRules(
        `import * as things from "#things";

const key = "one";

export const values = [things[key], things.two];
`,
        {
          filePath: "src/index.js",
          engrenageConfig: `export default { typescript: { files: ["**/*.{ts,js}"] } };\n`,
        },
      ),
    ).toEqual(["import-x/namespace"]);
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

  test("enables the performance conventions with the published trait", async () => {
    expect(
      await lintedPerformanceRules({
        traits: { published: false },
      }),
    ).toEqual([]);

    expect(
      await lintedPerformanceRules({
        traits: { published: true },
      }),
    ).toEqual([
      "auaust/no-zod-classic",
      "auaust/no-zod-namespace",
      "auaust/no-zod-namespace",
      "auaust/no-toolkit-root",
    ]);
  });

  test("lets options override the conventions of traits", async () => {
    expect(
      await lintedPerformanceRules(
        {
          traits: { published: true },
        },
        {
          performance: false,
        },
      ),
    ).toEqual([]);

    expect(
      await lintedPerformanceRules(
        {
          traits: { published: false },
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
        traits: { published: true },
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
          traits: { published: true },
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

  test("reports only malformed debt markers", async () => {
    const eslint = await getLinter();

    async function lintedComments(source: string) {
      const [result] = await eslint.lintText(source, {
        filePath: "src/violations.ts",
      });

      return map(
        result?.messages.filter(
          ({ ruleId }) => ruleId === "auaust/debt-markers",
        ) ?? [],
        (message) => message.line,
      );
    }

    expect(
      await lintedComments(
        "// @debt data.dirs could be empty when data is inactive\n/**\n * @debt first line\n * second line\n */\nexport {};\n",
      ),
    ).toEqual([]);

    expect(
      await lintedComments(
        "// @debt\n// @Debt: nope\n// see @debt below\n// @debt: nope\nexport {};\n",
      ),
    ).toEqual([1, 2, 3, 4]);
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

  test("reports unbraced case statements unless disabled", async () => {
    const source = `export function pick(value: string): number {
  switch (value) {
    case "a":
      return 1;
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

    expect(await lintedLayoutRules()).toEqual(["auaust/switch-case-braces"]);

    expect(
      await lintedLayoutRules({
        stylistic: {
          switches: false,
        },
      }),
    ).toEqual([]);
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
        ...(await createEslintConfig(await loadConfig(root), {
          typeAware: false,
        })),
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

  test("fixes complex concise arrows into padded blocks, nested ones included", async () => {
    const eslint = await getLinter(
      {
        typeAware: false,
      },
      true,
    );

    const source = `declare function pick(value: number): number;

export const first = 1;
export const choose = (value: number) => (value > 0 ? pick(value) : 0);
export const last = 2;

export const nested = (value: number) =>
  // keeps comments
  ({ pick: () => (value > 1 ? pick(value) : 0) });
`;

    const [result] = await eslint.lintText(source, {
      filePath: "src/arrows.ts",
    });

    expect(result?.messages).toEqual([]);

    const options = { ...prettierOptions, parser: "typescript" };

    expect(await format(result?.output ?? source, options)).toBe(
      `declare function pick(value: number): number;

export const first = 1;

export const choose = (value: number) => {
  return value > 0 ? pick(value) : 0;
};

export const last = 2;

export const nested = (value: number) => {
  return (
    // keeps comments
    {
      pick: () => {
        return value > 1 ? pick(value) : 0;
      },
    }
  );
};
`,
    );
  });

  test("fixes concise arrows Prettier wraps into blocks, one-line ones kept", async () => {
    const eslint = await getLinter(
      {
        typeAware: false,
      },
      true,
    );

    const source = `declare function describeEntry(name: string, value: number): string;

export const short = (name: string) => describeEntry(name, 1);

export const wrapped = (entries: [string, number][]) =>
  entries.map(([name, value]) => describeEntry(\`\${name}:\`, value));

export const spread = (first: string, second: string) => [
  first,
  second,
  "a long enough literal to break the array across lines",
];
`;

    const [result] = await eslint.lintText(source, {
      filePath: "src/arrows.ts",
    });

    expect(result?.messages).toEqual([]);

    const options = { ...prettierOptions, parser: "typescript" };

    expect(await format(result?.output ?? source, options)).toBe(
      `declare function describeEntry(name: string, value: number): string;

export const short = (name: string) => describeEntry(name, 1);

export const wrapped = (entries: [string, number][]) => {
  return entries.map(([name, value]) => describeEntry(\`\${name}:\`, value));
};

export const spread = (first: string, second: string) => {
  return [
    first,
    second,
    "a long enough literal to break the array across lines",
  ];
};
`,
    );
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
      overrideConfig: await createEslintConfig(await loadConfig(project.root)),
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

  test("reports longform properties, leaving quoted keys, shorthand and methods alone", async () => {
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
    ).toEqual(["24:auaust/object-shorthand"]);
  });

  test("leaves arrow parentheses and key quotes to Prettier", async () => {
    const rules = flatMap(
      await createEslintConfig(await loadConfig(root), {
        typeAware: false,
      }),
      (config) => keys(config.rules ?? {}),
    );

    expect(rules).not.toContain("@stylistic/arrow-parens");
    expect(rules).not.toContain("@stylistic/quote-props");
    expect(rules).not.toContain("auaust/quote-props");
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
    const configs = await createEslintConfig(await loadConfig(root), {
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
      overrideConfig: await createEslintConfig(await loadConfig(project.root)),
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

  test("lints Error subclasses clean in a baseline environment", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "name": "baseline", "type": "module" }',
      "engrenage.config.ts":
        'export default { src: { baseline: "2026-10" } };\n',
      "tsconfig.json": JSON.stringify({
        compilerOptions: { strict: true, module: "nodenext" },
        files: [],
        references: [{ path: "./tsconfig.src.json" }],
      }),
      "tsconfig.src.json": JSON.stringify({
        extends: "./tsconfig.json",
        compilerOptions: {
          target: "ESNext",
          lib: ["es2022"],
          types: [],
        },
        include: ["src"],
      }),
      "src/run.ts": [
        "class E extends Error {}",
        "export function fail(): never {",
        "  throw new E();",
        "}",
        "export function failText(): never {",
        '  throw "text";',
        "}",
        "",
      ].join("\n"),
    });

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: await createEslintConfig(await loadConfig(project.root)),
    });

    const [result] = await eslint.lintFiles(["src/run.ts"]);

    expect(
      (result?.messages ?? [])
        .filter((message) => {
          return message.ruleId === "@typescript-eslint/only-throw-error";
        })
        .map((message) => message.line),
    ).toEqual([6]);
  });

  test("checks typed rules and resolves aliases through the referenced tsconfig of each environment", async () => {
    const referencesRoot = getFixture("references");

    const eslint = new ESLint({
      cwd: referencesRoot,
      overrideConfigFile: true,
      overrideConfig: [
        ...(await createEslintConfig(await loadConfig(referencesRoot))),
        {
          rules: {
            "@typescript-eslint/no-unsafe-member-access": "error",
            "import-x/no-unresolved": "error",
          },
        },
      ],
    });

    const results = await eslint.lintFiles([
      "src/runtime.ts",
      "scripts/run.ts",
      "tool.config.ts",
      "tests/runtime.test.ts",
    ]);

    expect(
      map(results, (result) => {
        return [
          relative(referencesRoot, result.filePath),
          ...map(result.messages, (message) => message.ruleId),
        ];
      }),
    ).toEqual([
      ["src/runtime.ts", "@typescript-eslint/no-unsafe-member-access"],
      ["scripts/run.ts"],
      ["tool.config.ts"],
      ["tests/runtime.test.ts"],
    ]);
  });

  test("allows default exports in tool configs", async () => {
    expect(await lintedRules("tool.config.ts")).toEqual([]);
  });

  test("ignores gitignored and generated files", async () => {
    const eslint = await getLinter();

    expect(await eslint.isPathIgnored("src/ignored.ts")).toBe(true);
    expect(await eslint.isPathIgnored("coverage/report.ts")).toBe(true);

    expect(await eslint.isPathIgnored("tests/unit/fixtures/case.ts")).toBe(
      true,
    );

    expect(await eslint.isPathIgnored("src/violations.ts")).toBe(false);

    const unignored = await getLinter({
      ignore: false,
    });

    expect(await unignored.isPathIgnored("src/ignored.ts")).toBe(false);
  });

  test("scopes nested gitignore patterns to their own directory", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": JSON.stringify({ type: "module" }),
      ".gitignore": "/root.ts\n*.local.ts\n",
      "src/nested/.gitignore": "/skipped.ts\n",
    });

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: await createEslintConfig(await loadConfig(project.root)),
    });

    expect(await eslint.isPathIgnored("src/nested/skipped.ts")).toBe(true);
    expect(await eslint.isPathIgnored("src/skipped.ts")).toBe(false);
    expect(await eslint.isPathIgnored("root.ts")).toBe(true);
    expect(await eslint.isPathIgnored("src/nested/root.ts")).toBe(false);
    expect(await eslint.isPathIgnored("src/nested/a.local.ts")).toBe(true);
  });

  test("ignores the resolved tests.fixtures globs", async () => {
    const config = await loadConfig(root);

    const eslint = new ESLint({
      cwd: root,
      overrideConfigFile: true,
      overrideConfig: await createEslintConfig(
        overrideSections(
          config,
          new Map<ConfigKey, unknown>([
            [
              "files",
              {
                ...(await config.resolve("files")),
                fixtures: ["tests/**/data/**"],
              },
            ],
          ]),
        ),
      ),
    });

    expect(await eslint.isPathIgnored("tests/unit/data/case.ts")).toBe(true);

    expect(await eslint.isPathIgnored("tests/unit/fixtures/case.ts")).toBe(
      false,
    );
  });

  test("rejects unknown options", async () => {
    const config = await loadConfig(root);

    await expect(async () => {
      return await createEslintConfig(config, {
        comparisons: {
          // @ts-expect-error: unknown convention
          noTypof: false,
        },
      });
    }).rejects.toThrow("noTypof");
  });

  test("exposes its contract through the local aliases", () => {
    expectTypeOf(createEslintConfig).parameters.toEqualTypeOf<
      [LoadedConfig, Maybe<Options>?]
    >();

    expectTypeOf(createEslintConfig).returns.toEqualTypeOf<Promise<Config[]>>();
  });

  describe("auaust/no-return-undefined", () => {
    test.each([
      [
        "fixes an annotated function",
        'export function f(x: boolean): string | undefined {\n  if (x) {\n    return undefined;\n  }\n\n  return "a";\n}\n',
        'export function f(x: boolean): string | undefined {\n  if (x) {\n    return;\n  }\n\n  return "a";\n}\n',
        1,
      ],
      [
        "leaves an unannotated function to unicorn",
        "export function f() {\n  return undefined;\n}\n",
        undefined,
        0,
      ],
      [
        "ignores a shadowed undefined",
        "export function f(undefined: string): string | undefined {\n  return undefined;\n}\n",
        undefined,
        0,
      ],
    ])("%s", async (_name, source, output, count) => {
      if (output !== undefined) {
        const eslint = await getLinter({ typeAware: false }, true);

        const [result] = await eslint.lintText(source, {
          filePath: "src/returns.ts",
        });

        expect(result?.output).toBe(output);
      }

      const eslintReport = await getLinter({ typeAware: false });

      const [reported] = await eslintReport.lintText(source, {
        filePath: "src/returns.ts",
      });

      expect(
        reported?.messages.filter((message) => {
          return message.ruleId === "auaust/no-return-undefined";
        }),
      ).toHaveLength(count);
    });
  });

  describe("auaust/prefer-valued-return", () => {
    test("warns on an empty undefined guard before a valued return, and nothing else", async () => {
      const eslint = await getLinter();

      const [result] = await eslint.lintFiles(["src/valuedReturns.ts"]);

      expect(
        map(
          (result?.messages ?? []).filter((message) => {
            return message.ruleId === "auaust/prefer-valued-return";
          }),
          (message) => `${message.line}:${message.severity}`,
        ),
      ).toEqual(["2:1", "10:1"]);
    });

    test("wraps the valued return in the negated check without other rules reporting it", async () => {
      const eslint = await getLinter({}, true);

      const source = `export function guarded(value: string | undefined) {
  if (value === undefined) {
    return;
  }

  return value.length;
}
`;

      const [result] = await eslint.lintText(source, {
        filePath: "src/valuedReturns.ts",
      });

      expect(result?.output)
        .toBe(`export function guarded(value: string | undefined) {
  if (value !== undefined) {
    return value.length;
  }
}
`);

      const [repeated] = await (
        await getLinter()
      ).lintText(result?.output ?? source, {
        filePath: "src/valuedReturns.ts",
      });

      expect(repeated?.messages).toEqual([]);
    });
  });
});

describe("scopes", () => {
  test("neither lint nor report a file outside the declared environments", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": JSON.stringify({ type: "module" }),
      "src/index.ts": "export const a = 1;\n",
      "other/invalid.ts": "var x = ;\n",
    });

    const eslint = new ESLint({
      cwd: project.root,
      overrideConfigFile: true,
      overrideConfig: await createEslintConfig(await loadConfig(project.root)),
    });

    await expect(
      eslint.calculateConfigForFile("src/index.ts"),
    ).resolves.toMatchObject({
      languageOptions: { parser: expect.anything() },
    });

    const outside = await eslint.calculateConfigForFile("other/invalid.ts");

    expect(outside?.rules ?? {}).toEqual({});
    expect(outside?.languageOptions?.parser).toBeUndefined();
  });
});

describe("complexity limits", () => {
  const source = `export function pick(value: number): number {
  if (value > 0) {
    return value;
  }

  return 0;
}
`;

  const rules = [
    "auaust/cognitive-complexity",
    "auaust/max-lines-per-function",
    "auaust/max-lines",
  ];

  test("allow code within the default limits", async () => {
    const reported = await lintedProjectRules(source);

    for (const rule of rules) {
      expect(reported).not.toContain(rule);
    }
  });

  test("apply the limits of the format section", async () => {
    const reported = await lintedProjectRules(source, {
      engrenageConfig:
        "export default { format: { maxCognitiveComplexity: 0, maxFunctionLines: 2, maxFileLines: 2 } };\n",
    });

    expect(reported).toEqual(expect.arrayContaining(rules));
  });

  test("report identical functions", async () => {
    const body = `{
  const doubled = value * 2;
  const shifted = doubled + 1;

  return shifted;
}`;

    const reported = await lintedProjectRules(
      `export function first(value: number): number ${body}\n\nexport function second(value: number): number ${body}\n`,
    );

    expect(reported).toContain("auaust/no-identical-functions");
  });
});
