import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { assign } from "@auaust/toolkit/object";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const exported = "export const value = 1;\n";

async function createLinter(prefix = "auaust/import-") {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: {
        "#entry": "./src/entry.ts",
        "#foundation/*": "./src/foundation/*.ts",
        "#project/*": "./src/project/*.ts",
      },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { namespaces: { ".": { layers: ["foundation", "project"] } } } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
    }),
    "tests/helper.ts": exported,
    "src/foundation/base/index.ts": exported,
    "src/foundation/base/adapters/impl.ts": exported,
    "src/project/feature/index.ts": exported,
    "src/project/feature/utils/own.ts": exported,
    "src/project/feature/inner/index.ts": exported,
    "src/project/feature/inner/utils/deep.ts": exported,
    "src/project/other/index.ts": exported,
    "src/project/other/entry.ts": exported,
    "src/entry.ts": exported,
    "src/project/other/utils/priv.ts": exported,
    "src/project/other/constants.ts": exported,
  });

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

  test("names the index.ts of the target domain in a surfaces message", async () => {
    const lint = await createLinter();

    const [message] = await lint.messages(
      "src/project/feature/index.ts",
      'export { value } from "#project/other/utils/priv";\n',
    );

    expect(message).toContain("Import `#project/other/index` instead");
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

  test("lets only the root entry import a domain entry", async () => {
    const lint = await createLinter();

    expect(
      await lint(
        "src/project/feature/index.ts",
        'export { value } from "#project/other/entry";\n',
      ),
    ).toEqual(["auaust/import-surfaces"]);

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

  test("enforces role contracts", async () => {
    const lint = await createLinter("auaust/role-");

    expect(await lint("src/project/feature/utils/index.ts", exported)).toEqual([
      "auaust/role-contracts",
    ]);

    expect(
      await lint(
        "src/project/feature/utils/two.ts",
        "export const one = 1;\nexport const two = 2;\n",
      ),
    ).toEqual(["auaust/role-exports"]);
  });
});
