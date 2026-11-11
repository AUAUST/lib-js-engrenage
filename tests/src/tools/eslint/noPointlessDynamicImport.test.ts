import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { createEslintConfig } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";
import { entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const importer = "src/feature/utils/importer.ts";
const helper = "#feature/utils/helper";

async function createLinter() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: { "#feature/*": "./src/feature/*.ts" },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${renderCodeRoles(entry())} } };\n`,
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
    "src/feature/utils/helper.ts": "export function helper() {}\n",
    [importer]: "export {};\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root)),
  });

  return async (source: string) => {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve(importer),
    });

    expect(result?.fatalErrorCount).toBe(0);

    return (result?.messages ?? [])
      .filter(({ ruleId }) => ruleId === "auaust/no-pointless-dynamic-import")
      .map(({ message }) => message);
  };
}

const loading = `export const loaded = import("${helper}");\n`;

describe("no-pointless-dynamic-import", () => {
  test("reports a module the file also imports statically", async () => {
    const lint = await createLinter();

    expect(
      await lint(`import { helper } from "${helper}";\n\n${loading}`),
    ).toEqual([expect.stringContaining("already imported statically")]);
  });

  test("allows a module imported statically only for its types", async () => {
    const lint = await createLinter();

    expect(await lint(loading)).toEqual([]);

    expect(
      await lint(`import type { helper } from "${helper}";\n\n${loading}`),
    ).toEqual([]);
  });
});
