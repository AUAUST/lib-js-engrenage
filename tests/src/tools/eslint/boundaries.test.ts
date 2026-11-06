import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { entry } from "@auaust/engrenage/roles";
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
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry())}, namespaces: { ".": { layers: ["foundation", "project", "tools"] }, project: { layers: ["core", "*"] } } } };\n`,
    "tsconfig.json": "{}",
    "src/foundation/base/index.ts": exported,
    "src/project/core/index.ts": exported,
    "src/project/extra/index.ts": exported,
    "src/tools/kit/index.ts": exported,
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

    expect(
      await lint(
        "src/project/feature/utils/index.ts",
        "export const value = 1;\n",
      ),
    ).toEqual(["auaust/role-contracts"]);

    expect(
      await lint(
        "src/project/feature/utils/two.ts",
        "export const one = 1;\nexport const two = 2;\n",
      ),
    ).toEqual(["auaust/role-exports"]);
  });
});
