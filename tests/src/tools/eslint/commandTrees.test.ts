import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { structureSection } from "@auaust/engrenage";
import { loadConfig } from "@auaust/engrenage/config";
import { createEslintConfig } from "@auaust/engrenage/eslint";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

const command = "export default 1;\n";

async function createLinter() {
  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "library", type: "module" }),
    "engrenage.config.ts": 'export default { preset: "library" };\n',
    "scripts/index.ts": "export default 1;\n",
    "scripts/executable.ts": "await Promise.resolve();\n",
    "scripts/pnpm.ts": command,
    "scripts/codegen/index.ts": "export default 1;\n",
    "scripts/codegen/apis.ts": command,
    "scripts/codegen/actions/apis.ts": command,
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
  test("accept default-exported commands, groups and actions", async () => {
    const { project, lint } = await createLinter();

    const config = await loadConfig(project.root);

    expect(
      (await config.resolve(structureSection)).scripts?.unclassified,
    ).toEqual([]);

    for (const file of [
      "scripts/index.ts",
      "scripts/pnpm.ts",
      "scripts/codegen/index.ts",
      "scripts/codegen/actions/apis.ts",
    ]) {
      expect(await lint(file, command)).toEqual([]);
    }
  });

  test("require a command module to default-export its command", async () => {
    const { lint } = await createLinter();

    expect(
      await lint("scripts/codegen/apis.ts", "export const apis = 1;\n"),
    ).toEqual(["auaust/role-exports"]);
  });
});
