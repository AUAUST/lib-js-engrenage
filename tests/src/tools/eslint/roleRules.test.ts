import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage";
import { createEslintConfig } from "@auaust/engrenage/eslint";
import { entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const ownRule =
  "{ create(context) { return { Program(node) { context.report({ node, message: 'own' }); } }; } }";

const checkedRole = `{ name: "checked", rules: { "no-console": "error", own: ${ownRule} }, roles: [{ name: "inner", rules: { "no-alert": "error" } }] }`;

async function createLinter() {
  const roles = renderCodeRoles(entry()).slice(0, -1);

  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "library", type: "module" }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${roles}, ${checkedRole}], namespaces: { ".": { layers: ["project"] } } } };\n`,
    "src/project/feature/index.ts": "export {};\n",
    "src/project/feature/checked/one.ts": "export {};\n",
    "src/project/feature/checked/inner/two.ts": "export {};\n",
    "src/project/feature/utils/three.ts": "export {};\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
  });

  return async (filePath: string) => {
    const [result] = await eslint.lintText("console.log(1);\nalert(1);\n", {
      filePath: project.resolve(filePath),
    });

    return (result?.messages ?? [])
      .map(({ ruleId }) => ruleId)
      .filter((ruleId) => {
        return (
          ruleId === "no-console" ||
          ruleId === "no-alert" ||
          ruleId?.startsWith("roles/") === true
        );
      })
      .sort();
  };
}

describe("role rules", () => {
  test("apply a role's rule entries to its files only, never to a sibling or nested role's", async () => {
    const lint = await createLinter();

    expect(await lint("src/project/feature/checked/one.ts")).toEqual([
      "no-console",
      "roles/checked/own",
    ]);

    expect(await lint("src/project/feature/utils/three.ts")).toEqual([]);

    expect(await lint("src/project/feature/checked/inner/two.ts")).toEqual([
      "no-alert",
    ]);
  });

  test("register a role's rule modules as roles/<role>/<rule>", async () => {
    const lint = await createLinter();

    expect(await lint("src/project/feature/checked/one.ts")).toContain(
      "roles/checked/own",
    );
  });
});
