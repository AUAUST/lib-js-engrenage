import { ESLint } from "eslint";
import { describe, expect, onTestFinished, test } from "vitest";

import { createEslintConfig, defineRoleRule } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";
import { entry } from "@auaust/engrenage/roles";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

const sectionsRuleKey = "__engrenageSectionsRule";

const sectionsRule = defineRoleRule({
  description: "Reports the entity a role rule receives.",
  messages: { entity: "{{role}} in {{domain}}, entry {{entryFile}}" },
  create(context, entity, files) {
    return {
      Program(node) {
        context.report({
          node,
          messageId: "entity",
          data: {
            role: entity.role ?? "",
            domain: entity.domain ?? "",
            entryFile: files.entryFile ?? "",
          },
        });
      },
    };
  },
});

const ownRule = "{ tool: 'eslint', rule: { create(context) { return { Program(node) { context.report({ node, message: 'own' }); } }; } } }";

const stylelintRule = "{ tool: 'stylelint', rule: {} }";

const checkedRole = `{ name: "checked", rules: { "no-console": "error", own: ${ownRule}, styles: ${stylelintRule} }, roles: [{ name: "inner", rules: { "no-alert": "error" } }] }`;

const configRole = `{ name: "config", roles: [{ name: "sections", rules: { entity: globalThis.${sectionsRuleKey} } }] }`;

async function createLinter() {
  // @debt the temporary config cannot import `@auaust/engrenage`, so the rule crosses through `globalThis`; test configs should resolve the package
  Reflect.set(globalThis, sectionsRuleKey, sectionsRule);

  onTestFinished(() => {
    Reflect.deleteProperty(globalThis, sectionsRuleKey);
  });

  const roles = renderCodeRoles(entry()).slice(0, -1);

  const project = createTemporaryProject({
    "package.json": JSON.stringify({ name: "library", type: "module" }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${roles}, ${checkedRole}, ${configRole}], structure: { layers: ["project"] } } };\n`,
    "src/project/feature/index.ts": "export {};\n",
    "src/project/feature/checked/one.ts": "export {};\n",
    "src/project/feature/checked/inner/two.ts": "export {};\n",
    "src/project/feature/utils/three.ts": "export {};\n",
    "src/project/feature/config/four.ts": "export {};\n",
    "src/project/feature/config/sections/five.ts": "export {};\n",
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

    return (result?.messages ?? []).filter(({ ruleId }) => {
      return (
        ruleId === "no-console" ||
        ruleId === "no-alert" ||
        ruleId?.startsWith("roles/") === true
      );
    });
  };
}

async function createRuleLinter() {
  const lint = await createLinter();

  return async (filePath: string) => {
    return (await lint(filePath)).map(({ ruleId }) => ruleId).sort();
  };
}

describe("role rules", () => {
  test("apply a role's rule entries to its files only, never to a sibling or nested role's", async () => {
    const lint = await createRuleLinter();

    expect(await lint("src/project/feature/checked/one.ts")).toEqual([
      "no-console",
      "roles/checked/own",
    ]);

    expect(await lint("src/project/feature/utils/three.ts")).toEqual([]);

    expect(await lint("src/project/feature/checked/inner/two.ts")).toEqual([
      "no-alert",
    ]);
  });

  test("ignore a role rule module of another tool", async () => {
    const lint = await createRuleLinter();

    expect(await lint("src/project/feature/checked/one.ts")).not.toContain(
      "roles/checked/styles",
    );
  });

  test("register a role's rule modules as roles/<role>/<rule>", async () => {
    const lint = await createRuleLinter();

    expect(await lint("src/project/feature/checked/one.ts")).toContain(
      "roles/checked/own",
    );
  });

  test("pass a defineRoleRule module the file's entity and its environment's file names, on its role's files only", async () => {
    const lint = await createLinter();

    expect(await lint("src/project/feature/config/sections/five.ts")).toEqual([
      expect.objectContaining({
        ruleId: "roles/config/sections/entity",
        message: "config/sections in project/feature, entry entry.ts",
      }),
    ]);

    expect(await lint("src/project/feature/config/four.ts")).toEqual([]);
  });

  test("reject a raw rule module, naming defineRoleRule", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({ name: "library", type: "module" }),
      "engrenage.config.ts": `export default { src: { roles: [{ name: "raw", rules: { own: { create() { return {}; } } } }] } };\n`,
    });

    const config = await loadConfig(project.root);

    await expect(
      createEslintConfig(config, { typeAware: false }),
    ).rejects.toThrow("defineRoleRule");
  });
});
