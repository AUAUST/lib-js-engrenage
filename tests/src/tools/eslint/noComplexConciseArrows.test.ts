import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { createEslintConfig } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const file = "src/feature/utils/render.ts";

// @debt the temporary project and ESLint instance repeat noPointlessDynamicImport.test.ts; a shared test utility would own them
async function createLinter() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
    }),
    "engrenage.config.ts": `export default { preset: "library", format: { lineWidth: 60 } };\n`,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        strict: true,
        noEmit: true,
      },
      include: ["src"],
    }),
    [file]: "export {};\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root)),
  });

  return async (source: string) => {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve(file),
    });

    expect(result?.fatalErrorCount).toBe(0);

    return (result?.messages ?? [])
      .filter(({ ruleId }) => {
        return ruleId === "auaust/no-complex-concise-arrows";
      })
      .map(({ line, fix }) => {
        return { line, fix: fix?.text };
      });
  };
}

describe("no-complex-concise-arrows", () => {
  test("turns a concise arrow on a line past the line width into a block body", async () => {
    const lint = await createLinter();

    const findings = await lint(
      "export const rendered = [1].map((item) => `- ${item}`).join();\n",
    );

    expect(findings).toStrictEqual([
      { line: 1, fix: " {\n  return `- ${item}`;\n}" },
    ]);
  });

  test("keeps a concise arrow on a line within the line width", async () => {
    const lint = await createLinter();

    expect(
      await lint("export const items = [1].map((item) => item);\n"),
    ).toStrictEqual([]);
  });

  test("reports only the outermost concise arrow of a long line", async () => {
    const lint = await createLinter();

    const findings = await lint(
      "export const nested = [[1]].map((row) => row.map((cell) => cell));\n",
    );

    expect(findings).toStrictEqual([
      { line: 1, fix: " {\n  return row.map((cell) => cell);\n}" },
    ]);
  });
});
