import { ESLint } from "eslint";
import { expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { createEslintConfig } from "@auaust/engrenage/eslint";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

test("tooling imports src internals like scripts do, but never bin", async () => {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: { "#project/*": "./src/project/*.ts" },
    }),
    "engrenage.config.ts":
      'export default { preset: "library", src: { namespaces: { ".": { layers: ["project"] } } }, tooling: { dirs: ["tooling"] } };\n',
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        module: "nodenext",
        moduleResolution: "nodenext",
        allowImportingTsExtensions: true,
        noEmit: true,
      },
    }),
    "src/project/feature/index.ts": "export const value = 1;\n",
    "bin/command.ts": "export const command = 1;\n",
    "tooling/index.ts": "export {};\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  async function lint(source: string) {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve("tooling/helper.ts"),
    });

    return (result?.messages ?? [])
      .map(({ ruleId }) => ruleId)
      .filter((ruleId) => ruleId?.startsWith("auaust/import-") === true);
  }

  expect(
    await lint('export { value } from "#project/feature/index";\n'),
  ).toEqual([]);

  expect(
    await lint('export { command } from "../bin/command.ts";\n'),
  ).not.toEqual([]);
});
