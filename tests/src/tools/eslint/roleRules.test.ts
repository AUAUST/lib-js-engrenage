import { dirname, resolve } from "node:path";

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

const modulesRule = defineRoleRule({
  description: "Reports the role and domain of each module a role rule meets.",
  messages: {
    module: "{{module}}: {{role}} in {{domain}}, {{kind}}",
  },
  create(context, _entity, _files, modules) {
    function render(
      module: string,
      entity: ReturnType<typeof modules.entityOf>,
      kind: string,
    ) {
      return {
        messageId: "module",
        data: {
          module,
          role: entity?.role ?? "none",
          domain: entity?.domain ?? "none",
          kind,
        },
      };
    }

    return {
      ImportDeclaration(node) {
        const specifier = String(node.source.value);
        const { target, kind } = modules.importOf(node, specifier);

        context.report({ node, ...render(specifier, target, kind) });
      },
      Program(node) {
        const declaring = resolve(
          dirname(context.filename),
          "../utils/three.ts",
        );

        const entity = modules.entityOf(declaring);

        context.report({ node, ...render("three.ts", entity, "path") });
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
        "config": {
          modules: () => Promise.resolve(modulesRule),
        },
      },
    },
  );

  return async (filePath: string, source = "console.log(1);\nalert(1);\n") => {
    return lint(
      filePath,
      (ruleId) => {
        return (
          ruleId === "no-console" ||
          ruleId === "no-alert" ||
          ruleId.startsWith("roles/")
        );
      },
      source,
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

    expect(await lint("src/project/feature/config/four.ts")).toEqual([
      expect.objectContaining({ ruleId: "roles/config/modules" }),
    ]);
  });

  test("resolve the module paths and import specifiers a defineRoleRule module meets to their role and domain", async () => {
    const lint = await createLinter();

    const messages = await lint(
      "src/project/feature/config/three.ts",
      'import type { A } from "#project/feature/utils/three";\nimport "./four.ts";\nimport "eslint";\n',
    );

    expect(messages.map(({ message }) => message)).toEqual([
      "three.ts: utils in project/feature, path",
      "#project/feature/utils/three: utils in project/feature, type",
      "./four.ts: config in project/feature, runtime",
      "eslint: none in none, runtime",
    ]);
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
