import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { actions, createRolePreset, entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const operations = createRolePreset({
  name: "operations",
  exports: "named-match",
  effects: "effectful",
});

const command = "src/feature/operations/command.ts";
const action = "#feature/actions/run";
const other = "#feature/actions/other";
const helper = "#feature/utils/helper";

async function createLinter() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: { "#feature/*": "./src/feature/*.ts" },
      peerDependencies: { optional: "*", required: "*" },
      peerDependenciesMeta: { optional: { optional: true } },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry(), operations(), actions())} } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        allowImportingTsExtensions: true,
        strict: true,
        noEmit: true,
      },
      include: ["src"],
    }),
    "src/feature/index.ts": "export {};\n",
    [command]: "export {};\n",
    "src/feature/actions/run.ts": "export default function () {}\n",
    "src/feature/actions/other.ts": "export default function () {}\n",
    "src/feature/utils/helper.ts": "export function helper() {}\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root)),
  });

  return async (source: string) => {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve(command),
    });

    return (result?.messages ?? [])
      .filter(({ ruleId }) => ruleId === "auaust/no-pointless-dynamic-import")
      .map(({ message }) => message);
  };
}

function loading(...specifiers: readonly string[]) {
  const imports = specifiers.map((specifier) => `import(${specifier});`);

  return `export function command() {\n  ${imports.join("\n  ")}\n}\n`;
}

describe("no-pointless-dynamic-import", () => {
  test("allows a lazy role and an optional peer", async () => {
    const lint = await createLinter();

    expect(await lint(loading(`"${action}"`))).toEqual([]);
    expect(await lint(loading(`"optional"`))).toEqual([]);
  });

  test("reports a target that is neither lazy nor an optional peer", async () => {
    const lint = await createLinter();

    expect(await lint(loading(`"${helper}"`))).toEqual([
      expect.stringContaining("neither a lazy role"),
    ]);

    expect(await lint(loading(`"required"`))).toEqual([
      expect.stringContaining("neither a lazy role"),
    ]);
  });

  test("reports a second import() in the same function", async () => {
    const lint = await createLinter();

    expect(await lint(loading(`"${action}"`, `"${other}"`))).toEqual([
      expect.stringContaining("already has an import()"),
    ]);
  });

  test("reports a module the file also imports statically", async () => {
    const lint = await createLinter();

    expect(
      await lint(`import run from "${action}";\n\n${loading(`"${action}"`)}`),
    ).toEqual([expect.stringContaining("already imported statically")]);
  });

  test("reports a computed specifier outside a discovered role", async () => {
    const lint = await createLinter();

    expect(await lint(loading("`#feature/${name}`"))).toEqual([
      expect.stringContaining("discovered role"),
    ]);
  });
});
