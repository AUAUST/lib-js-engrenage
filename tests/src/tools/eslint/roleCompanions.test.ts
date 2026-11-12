import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { createEslintConfig } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const guardsRole = '{ name: "guards", companions: ({ name }) => [`src/assert/assert${name.slice(2)}.ts`, ...extra] }';

// @debt duplicates the temporary-project linter setup of `roleRules.test.ts` and `typeOnlyRoles.test.ts`; a shared test utility would own it
async function createLinter(
  extra: readonly string[] = [],
  files: Readonly<Record<string, string>> = {},
) {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "library", type: "module" }),
    "engrenage.config.ts": `const extra = ${JSON.stringify(extra)};\n\nexport default { preset: "library", src: { roles: [...${renderCodeRoles()}, ${guardsRole}, { name: "assert" }, { name: "notes" }] } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
    }),
    "src/guards/isString.ts": "export const isString = 1;\n",
    "src/notes/isString.ts": "export const isString = 1;\n",
    ...files,
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  return async (filePath: string) => {
    const [result] = await eslint.lintFiles([project.resolve(filePath)]);

    return (result?.messages ?? [])
      .filter(({ ruleId }) => ruleId === "auaust/role-companions")
      .map(({ line, message }) => `${line}:${message}`);
  };
}

describe("role companions", () => {
  test("report a missing companion until it exists", async () => {
    expect(await (await createLinter())("src/guards/isString.ts")).toEqual([
      "1:The guards role requires src/assert/assertString.ts beside this module; create it.",
    ]);

    expect(
      await (
        await createLinter([], {
          "src/assert/assertString.ts": "export const assertString = 1;\n",
        })
      )("src/guards/isString.ts"),
    ).toEqual([]);
  });

  test("name only the absent companion", async () => {
    expect(
      await (
        await createLinter(["src/ensure/ensureString.ts"], {
          "src/ensure/ensureString.ts": "export const ensureString = 1;\n",
        })
      )("src/guards/isString.ts"),
    ).toEqual([
      "1:The guards role requires src/assert/assertString.ts beside this module; create it.",
    ]);
  });

  test("leave a role without companions alone", async () => {
    expect(await (await createLinter())("src/notes/isString.ts")).toEqual([]);
  });
});
