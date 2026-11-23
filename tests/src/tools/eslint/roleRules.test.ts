import { describe, expect, test } from "vitest";

import { createEslintConfig, defineRoleRule } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";
import { entry } from "@auaust/engrenage/roles";

import { createProjectLinter } from "#tests/utils/createProjectLinter";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";

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

const ownRule = defineRoleRule({
  description: "Reports every file.",
  messages: { own: "own" },
  create(context) {
    return {
      Program(node) {
        context.report({ node, messageId: "own" });
      },
    };
  },
});

const checkedRole = '{ name: "checked", rules: { "no-console": "error" }, roles: [{ name: "inner", rules: { "no-alert": "error" } }] }';

const configRole = '{ name: "config", roles: [{ name: "sections" }] }';

async function createLinter() {
  const roles = renderCodeRoles(entry()).slice(0, -1);

  const { lint } = await createProjectLinter(
    `export default { preset: "library", src: { roles: ${roles}, ${checkedRole}, ${configRole}], structure: { layers: ["project"] } } };\n`,
    {
      "src/project/feature/index.ts": "export {};\n",
      "src/project/feature/checked/one.ts": "export {};\n",
      "src/project/feature/checked/inner/two.ts": "export {};\n",
      "src/project/feature/utils/three.ts": "export {};\n",
      "src/project/feature/config/four.ts": "export {};\n",
      "src/project/feature/config/sections/five.ts": "export {};\n",
    },
    {
      roleRules: {
        "checked": {
          own: () => Promise.resolve(ownRule),
        },
        "config/sections": {
          entity: () => Promise.resolve(sectionsRule),
        },
      },
    },
  );

  return async (filePath: string) => {
    return lint(
      filePath,
      (ruleId) => {
        return (
          ruleId === "no-console" ||
          ruleId === "no-alert" ||
          ruleId.startsWith("roles/")
        );
      },
      "console.log(1);\nalert(1);\n",
    );
  };
}

async function createRuleLinter() {
  const lint = await createLinter();

  return async (filePath: string) => {
    return (await lint(filePath)).map(({ ruleId }) => ruleId).sort();
  };
}

describe("role rules", () => {
  test("apply a role's rule entries and rule loaders to its files only, never to a sibling or nested role's", async () => {
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

  test("reject a rule module in a role's contract, naming the roleRules option", async () => {
    const project = createTemporaryProject({
      "package.json": JSON.stringify({
        name: "library",
        type: "module",
      }),
      "engrenage.config.ts": `export default { src: { roles: [{ name: "raw", rules: { own: async () => ({}) } }] } };\n`,
    });

    const config = await loadConfig(project.root);

    await expect(
      createEslintConfig(config, { typeAware: false }),
    ).rejects.toThrow("roleRules");
  });
});
