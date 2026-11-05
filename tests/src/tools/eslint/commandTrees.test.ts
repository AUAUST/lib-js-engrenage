import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { createEslintConfig } from "@auaust/engrenage/eslint";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const command = "export const apis = 1;\n";

async function createLinter() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "library", type: "module" }),
    "engrenage.config.ts": 'export default { preset: "library" };\n',
    "scripts/index.ts": "export const program = 1;\n",
    "scripts/pnpm.ts": "export const pnpm = 1;\n",
    "scripts/codegen/index.ts": "export const codegen = 1;\n",
    "scripts/codegen/apis.ts": command,
    "scripts/codegen/operations/generateThing.ts":
      "export const generateThing = 1;\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  return {
    project,
    async lint(filePath: string, source: string) {
      const [result] = await eslint.lintText(source, {
        filePath: project.resolve(filePath),
      });

      return (result?.messages ?? [])
        .map(({ ruleId }) => ruleId)
        .filter((ruleId) => {
          return (
            ruleId === "auaust/domain-content" ||
            ruleId === "auaust/index-declarations" ||
            ruleId === "auaust/role-exports"
          );
        });
    },
  };
}

describe("command trees", () => {
  test("accept command modules and the declarations of a group index", async () => {
    const { project, lint } = await createLinter();
    const config = await loadConfig(project.root);

    expect((await config.get("structure")).scripts?.unclassified).toEqual([]);

    expect(
      await lint(
        "scripts/index.ts",
        "export function program() {\n  return 1;\n}\n",
      ),
    ).toEqual([]);

    expect(await lint("scripts/pnpm.ts", "export const pnpm = 1;\n")).toEqual(
      [],
    );

    expect(
      await lint(
        "scripts/codegen/index.ts",
        "export function codegen() {\n  return 1;\n}\n",
      ),
    ).toEqual([]);
  });

  test("require a command module to export one command named after its file", async () => {
    const { lint } = await createLinter();

    expect(
      await lint(
        "scripts/codegen/apis.ts",
        "export const apis = 1;\nexport const other = 2;\n",
      ),
    ).toEqual(["auaust/role-exports"]);
  });
});
