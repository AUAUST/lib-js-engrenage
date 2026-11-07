import { ESLint } from "eslint";
import { expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { constants, entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

test("readonly-constants follows the file of the constants role", async () => {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "library", type: "module" }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${JSON.stringify([constants({ file: ["consts.ts"] })])} } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        strict: true,
        noEmit: true,
      },
      include: ["src"],
    }),
    "src/consts.ts": "export const value = 1;\n",
    "src/constants.ts": "export const value = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root)),
  });

  async function lint(file: string) {
    const [result] = await eslint.lintText("export const list = [1];\n", {
      filePath: project.resolve(file),
    });

    return (result?.messages ?? []).map(({ ruleId }) => ruleId);
  }

  expect(await lint("src/consts.ts")).toContain("auaust/readonly-constants");

  expect(await lint("src/constants.ts")).not.toContain(
    "auaust/readonly-constants",
  );
});

test("readonly-constants accepts frozen values and reports mutable ones", async () => {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "library", type: "module" }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry())} } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        strict: true,
        noEmit: true,
      },
      include: ["src"],
    }),
    "src/constants.ts": "export const value = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root)),
  });

  async function lint(code: string) {
    const [result] = await eslint.lintText(
      `const freeze = <T>(value: T): Readonly<T> => value;\n${code}`,
      { filePath: project.resolve("src/constants.ts") },
    );

    return (result?.messages ?? []).map(({ ruleId }) => ruleId);
  }

  expect(await lint("export const pattern = freeze(/x/);\n")).not.toContain(
    "auaust/readonly-constants",
  );

  expect(await lint("export const pattern = /x/;\n")).toContain(
    "auaust/readonly-constants",
  );

  expect(
    await lint('export const value = freeze({ a: ["x"] } as const);\n'),
  ).not.toContain("auaust/readonly-constants");

  expect(await lint('export const value = freeze({ a: ["x"] });\n')).toContain(
    "auaust/readonly-constants",
  );
});
