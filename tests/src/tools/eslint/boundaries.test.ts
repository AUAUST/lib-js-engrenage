import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { createEslintConfig } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";
import { createRolePreset, entry } from "@auaust/engrenage/roles";
import { assign } from "@auaust/toolkit/object";

import { createBoundaryProject } from "#tests/utils/createBoundaryProject";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const exported = "export const value = 1;\n";

function createNestedLayersProject() {
  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: {
        "#foundation/*": "./src/foundation/*.ts",
        "#project/*": "./src/project/*.ts",
        "#tools/*": "./src/tools/*.ts",
      },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry())}, structure: { layers: ["foundation", "project", "tools"], namespaces: { project: { layers: ["core", "*"] } } } } };\n`,
    "tsconfig.json": "{}",
    "src/foundation/base/index.ts": exported,
    "src/project/core/index.ts": exported,
    "src/project/extra/index.ts": exported,
    "src/tools/kit/index.ts": exported,
  });
}

function createConfigRoleProject(strict: boolean) {
  const config = createRolePreset({
    name: "config",
    strict,
    roles: [
      { name: "schemas", file: "*Schema.ts" },
      { name: "definers", file: "define*Config.ts" },
    ],
  });

  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry(), config())} } };\n`,
    "tsconfig.json": "{}",
    "src/feature/index.ts": exported,
    "src/feature/config/featureSchema.ts": exported,
    "src/feature/config/helper.ts": exported,
  });
}

function createDerivedDefinerProject() {
  const config = createRolePreset({
    name: "config",
    strict: true,
    roles: [{ name: "definers", file: "<definers>" }],
  });

  const roles = renderCodeRoles(entry(), config()).replace(
    JSON.stringify("<definers>"),
    "({ lineage }) => `define${lineage.at(-1).name}Config.ts`",
  );

  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${roles} } };\n`,
    "tsconfig.json": "{}",
    "src/tools/vite/index.ts": exported,
    "src/tools/vite/config/defineviteConfig.ts": exported,
  });
}

function createBarrelProject() {
  const conventions = createRolePreset({
    name: "conventions",
    exports: "default",
    index: true,
  });

  const assets = createRolePreset({
    name: "assets",
    accepts: "*.json",
  });

  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: {
        "#foundation/*": "./src/foundation/*.ts",
        "#project/*": "./src/project/*.ts",
      },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry(), conventions(), assets())}, structure: { layers: ["foundation", "project"] } } };\n`,
    "tsconfig.json": "{}",
    "src/foundation/base/index.ts": exported,
    "src/project/feature/index.ts": exported,
    "src/project/feature/utils/index.ts": "export const index = 1;\n",
    "src/project/feature/conventions/first.ts": "export default 1;\n",
    "src/project/feature/assets/index.ts": exported,
    "src/project/other/index.ts": exported,
  });
}

function createCollectedProject() {
  const collected = createRolePreset({
    name: "collected",
    file: "collected.ts",
    exports: "default",
    public: true,
    collected: true,
  });

  const shared = createRolePreset({ name: "shared", public: true });

  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: { "#project/*": "./src/project/*.ts" },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry(), collected(), shared())}, structure: { layers: ["project"] } } };\n`,
    "tsconfig.json": "{}",
    "src/project/feature/index.ts": exported,
    "src/project/other/index.ts": exported,
    "src/project/other/inner/index.ts": exported,
    "src/project/other/inner/collected.ts": "export default 1;\n",
    "src/project/other/inner/shared/value.ts": exported,
  });
}

function createConsumerProject() {
  const operations = createRolePreset({ name: "operations" });

  return createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: { "#workflows/*": "./src/workflows/*.ts" },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry(), operations())}, structure: { layers: ["workflows"] } } };\n`,
    "tsconfig.json": "{}",
    "src/workflows/cli/index.ts": exported,
    "src/workflows/cli/operations/runProgram.ts": exported,
    "bin/command.ts": exported,
  });
}

async function createLinter(
  prefix = "auaust/import-",
  project = createBoundaryProject(),
) {
  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  async function report(filePath: string, source: string) {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve(filePath),
    });

    return (result?.messages ?? []).filter(({ ruleId }) => {
      return ruleId?.startsWith(prefix) === true;
    });
  }

  async function lint(filePath: string, source: string) {
    return (await report(filePath, source)).map(({ ruleId }) => ruleId);
  }

  return assign(lint, {
    messages: async (filePath: string, source: string) => {
      return (await report(filePath, source)).map(({ message }) => message);
    },
  });
}

describe("structure boundaries", () => {
  test("enforces layers, surfaces and sub-domain reach", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/foundation/base/index.ts",
        'export { value } from "#project/feature/index";\n',
      ),
    ).toEqual(["auaust/import-layers"]);

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value as a } from "#foundation/base/index";\nexport { value as b } from "#project/other/index";\nexport { value as c } from "#foundation/base/adapters/impl";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value } from "#project/other/utils/priv";\n',
      ),
    ).toEqual(["auaust/import-surfaces"]);

    expect(
      await lint(
        "src/project/feature/inner/utils/deep.ts",
        'export { value } from "#project/feature/utils/own";\n',
      ),
    ).toEqual([]);
  });

  test("reaches a collected role inside a sub-domain past its parent's surface", async () => {
    const lint = await createLinter("auaust/import-", createCollectedProject());

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { default } from "#project/other/inner/collected";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value } from "#project/other/inner/shared/value";\n',
      ),
    ).toEqual(["auaust/import-surfaces"]);
  });

  test("names the index.ts of the target domain in a surfaces message", async () => {
    const lint = await createLinter();

    const [message] = await lint.messages(
      "src/project/feature/index.ts",
      'export { value } from "#project/other/utils/priv";\n',
    );

    expect(message).toContain("private to `project/other`");

    expect(message).toContain("Import it from `#project/other/index`");
  });

  test("names the layer order of an upward import", async () => {
    const lint = await createLinter();

    const [message] = await lint.messages(
      "src/foundation/base/index.ts",
      'export { value } from "#project/feature/index";\n',
    );

    expect(message).toContain("foundation < project");
    expect(message).toContain("Move the code down, or inject it");
  });

  test("sends a domain importing its own index to the role module", async () => {
    const lint = await createLinter();

    expect(
      await lint.messages(
        "src/project/feature/utils/own.ts",
        'export { value } from "#project/feature/index";\n',
      ),
    ).toEqual([
      "A module of `project/feature` imports `#project/feature/index`. Import the role module directly.",
    ]);
  });

  test("decides layers at the container both sides share", async () => {
    const lint = await createLinter(
      "auaust/import-",
      createNestedLayersProject(),
    );

    expect(
      await lint(
        "src/project/core/index.ts",
        'export { value } from "#foundation/base/index";\n',
      ),
    ).toEqual([]);

    const messages = await lint.messages(
      "src/project/core/index.ts",
      'export { value } from "#tools/kit/index";\n',
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain("foundation < project < tools");
  });

  test("lets a peer import the constants of a domain", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value } from "#project/other/constants";\n',
      ),
    ).toEqual([]);
  });

  test("lets a module import another domain's entry as a public entry", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value } from "#project/other/entry";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/foundation/base/index.ts",
        'export { value } from "#project/other/entry";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/foundation/base/index.ts",
        'import type * as other from "#project/other/entry";\n\nexport type Other = typeof other;\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/project/other/entry.ts",
        'export { value } from "#project/other/index";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/entry.ts",
        'export { value as a } from "#project/other/entry";\nexport { value as b } from "#project/feature/index";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value } from "#entry";\n',
      ),
    ).not.toEqual([]);
  });

  test("gives utils the reach of their domain, at runtime and type-only", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/feature/utils/own.ts",
        'export type { value } from "#project/other/index";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/project/feature/utils/own.ts",
        'export { value } from "#project/other/index";\n',
      ),
    ).toEqual([]);
  });

  test("keeps public tests on the package name and source tests on internals", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "tests/a.test.ts",
        'import { value } from "#foundation/base/index";\nexport { value };\n',
      ),
    ).toEqual(["auaust/import-tests"]);

    expect(
      await lint(
        "tests/a.test.src.ts",
        'import { value } from "library";\nexport { value };\n',
      ),
    ).toEqual(["auaust/import-tests"]);

    expect(
      await lint(
        "tests/a.test.src.ts",
        'import { value } from "#foundation/base/index";\nexport { value };\n',
      ),
    ).toEqual([]);
  });

  test("lets bin reach src only through domain surfaces, tests through their variant", async () => {
    const lint = await createLinter("auaust/import-", createConsumerProject());

    const internal = 'export { value } from "#workflows/cli/operations/runProgram";\n';

    expect(await lint("bin/command.ts", internal)).toEqual([
      "auaust/import-surfaces",
    ]);

    const [message] = await lint.messages("bin/command.ts", internal);

    expect(message).toContain("Import it from `#workflows/cli/index`");

    expect(
      await lint(
        "bin/command.ts",
        'export { value } from "#workflows/cli/index";\n',
      ),
    ).toEqual([]);

    expect(await lint("tests/a.test.src.ts", internal)).toEqual([]);
  });

  test("names the alias of a relative specifier and reports unknown paths", async () => {
    const lint = await createLinter("auaust/import-specifiers");

    expect(
      await lint.messages(
        "src/project/feature/utils/x.ts",
        'export { value } from "./own";\n',
      ),
    ).toEqual(["Import `#project/feature/utils/own` instead of `./own`."]);

    const [unknown] = await lint.messages(
      "src/project/feature/utils/x.ts",
      'export { value } from "#project/missing/index";\n',
    );

    expect(unknown).toContain("reload the editor window");

    expect(
      await lint(
        "src/project/feature/utils/x.ts",
        'export { default } from "#package.json";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "engrenage.config.ts",
        'export { value } from "@auaust/engrenage";\n',
      ),
    ).toEqual([]);
  });

  test("enforces role contracts", async () => {
    const lint = await createLinter("auaust/role-");

    expect(
      await lint(
        "src/project/feature/utils/index.ts",
        "export const value = 1;\n",
      ),
    ).toEqual(["auaust/role-exports"]);

    expect(
      await lint(
        "src/project/feature/utils/two.ts",
        "export const one = 1;\nexport const two = 2;\n",
      ),
    ).toEqual(["auaust/role-exports"]);

    expect(
      await lint(
        "src/project/feature/utils/isString.ts",
        'export interface IsStringOptions {\n  strict: boolean;\n}\n\nexport function isString(value: unknown): value is string {\n  return typeof value === "string";\n}\n',
      ),
    ).toEqual([]);

    expect(
      await lint.messages(
        "src/project/feature/utils/isString.ts",
        "export const isString = 1;\nexport const other = 2;\n",
      ),
    ).toEqual([
      "A module of utils exports only the value `isString`, named after the file, and no default export.",
    ]);
  });

  test("treats a file named like the index file as a module of a role without index", async () => {
    const barrel = "If this file is intended as a barrel, enable `index` on the role.";

    const lint = await createLinter("auaust/", createBarrelProject());

    const utils = "src/project/feature/utils/index.ts";

    expect(await lint(utils, "export const index = 1;\n")).toEqual([]);

    expect(
      await lint(
        utils,
        'export { value as index } from "#foundation/base/index";\n',
      ),
    ).toEqual([]);

    for (const source of [
      "export const other = 1;\n",
      "export const index = 1;\nexport const other = 2;\n",
      'export * from "#foundation/base/index";\n',
    ]) {
      const [message] = await lint.messages(utils, source);

      expect(message).toContain(barrel);
    }

    expect(
      await lint(
        "src/project/feature/conventions/index.ts",
        'export { default as first } from "#project/feature/conventions/first";\n',
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/project/feature/conventions/index.ts",
        "export const value = 1;\n",
      ),
    ).toEqual(["auaust/index-declarations"]);

    expect(
      await lint(
        "src/project/other/index.ts",
        'export { index } from "#project/feature/utils/index";\n',
      ),
    ).toEqual(["auaust/import-surfaces"]);

    expect(await lint("src/project/feature/assets/index.ts", exported)).toEqual(
      ["auaust/role-contracts"],
    );

    expect(await lint("src/project/feature/utils/entry.ts", exported)).toEqual([
      "auaust/role-exports",
    ]);

    expect(
      await lint(
        "src/project/feature/utils/entry.ts",
        "export const entry = 1;\n",
      ),
    ).toEqual([]);
  });

  test("keeps domain indexes and role barrels free of work at import, entries exempt", async () => {
    const lint = await createLinter(
      "auaust/index-declarations",
      createBarrelProject(),
    );

    const work = "export default createThing();\n";

    expect(await lint("src/project/feature/index.ts", work)).toEqual([
      "auaust/index-declarations",
    ]);

    expect(await lint("src/project/feature/entry.ts", work)).toEqual([]);

    expect(await lint("src/project/feature/entry.ts", exported)).toEqual([]);

    expect(
      await lint("src/project/feature/conventions/index.ts", exported),
    ).toEqual(["auaust/index-declarations"]);

    expect(
      await lint(
        "src/project/feature/conventions/index.ts",
        'export { default } from "#project/feature/conventions/first";\n',
      ),
    ).toEqual([]);
  });

  test("accepts at a strict role's root only the files its nested roles name", async () => {
    const helper = "src/feature/config/helper.ts";
    const schema = "src/feature/config/featureSchema.ts";

    const strict = await createLinter(
      "auaust/role-contracts",
      createConfigRoleProject(true),
    );

    const [message] = await strict.messages(helper, exported);

    expect(message).toContain("*Schema.ts, define*Config.ts");
    expect(await strict(schema, exported)).toEqual([]);

    const loose = await createLinter(
      "auaust/role-contracts",
      createConfigRoleProject(false),
    );

    expect(await loose(helper, exported)).toEqual([]);
  });

  test("names in a strict message the root files a callback derives for the location", async () => {
    const strict = await createLinter(
      "auaust/role-contracts",
      createDerivedDefinerProject(),
    );

    const [message] = await strict.messages(
      "src/tools/vite/config/defineViteConfiguration.ts",
      exported,
    );

    expect(message).toContain("only defineviteConfig.ts;");

    expect(
      await strict("src/tools/vite/config/defineviteConfig.ts", exported),
    ).toEqual([]);
  });
});
