import { ESLint } from "eslint";
import { describe, expect, test } from "vitest";

import { assign } from "@auaust/toolkit/object";

import { loadConfig } from "#project/config/index";
import { entrypoint } from "#project/roles/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { renderCodeRoles } from "#tests/utils/renderCodeRoles";
import { definerEntries, sectionDeclarations } from "#tooling/eslint/index";
import { createEslintConfig } from "#tools/eslint/index";
import { extension } from "#tools/eslint/roles/index";

const configRole = `{ name: "config", roles: [{ name: "definers", file: "define*Config.ts" }, { name: "schemas", accepts: "*Schema.ts" }, { name: "sections", accepts: "*Section.ts" }] }`;

async function createLinter() {
  const roles = renderCodeRoles(entrypoint()).slice(0, -1);

  const project = createTemporaryProject({
    "package.json": JSON.stringify({
      name: "library",
      type: "module",
      imports: { "#project/*": "./src/project/*.ts" },
    }),
    "engrenage.config.ts": `export default { preset: "library", src: { roles: ${roles}, ${configRole}, ${JSON.stringify(extension())}], structure: { layers: ["project"] } } };\n`,
    "src/project/listed/index.ts": "export {};\n",
    "src/project/listed/entry.ts": 'export { defineListedConfig } from "./config/defineListedConfig.ts";\n',
    "src/project/listed/config/sections/listedSection.ts": "export {};\n",
    "src/project/listed/constants.ts": "export const listed = 1;\n",
    "src/project/listed/inner/extension.ts": "export default {};\n",
    "src/project/unlisted/index.ts": "export {};\n",
    "src/project/unlisted/entry.ts": "export const other = 1;\n",
    "src/project/unlisted/config/schemas/unlistedSchema.ts": "export {};\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
      roleRules: {
        "config/definers": {
          "definer-entries": () => Promise.resolve(definerEntries),
        },
        "config/sections": {
          "section-declarations": () => Promise.resolve(sectionDeclarations),
        },
      },
    }),
  });

  // @debt the linting harness duplicates the one in tests/src/tools/eslint/boundaries.test.ts; a shared test util would own it
  async function report(filePath: string, source: string) {
    const [result] = await eslint.lintText(source, {
      filePath: project.resolve(filePath),
    });

    return (result?.messages ?? []).filter(({ ruleId }) => {
      return ruleId?.startsWith("roles/") === true;
    });
  }

  async function lint(filePath: string, source: string) {
    const messages = await report(filePath, source);

    return messages.map(({ ruleId }) => ruleId);
  }

  async function messageIds(filePath: string, source: string) {
    const messages = await report(filePath, source);

    return messages.map(({ messageId }) => messageId);
  }

  return assign(lint, { messageIds });
}

describe("tooling role rules", () => {
  test("report a section export not built by declareSection(…)", async () => {
    const lint = await createLinter();

    const file = "src/project/listed/config/sections/listedSection.ts";

    expect(
      await lint(file, "export const listedSection = { name: 'listed' };\n"),
    ).toEqual(["roles/config/sections/section-declarations"]);

    expect(
      await lint(
        file,
        "const declareSection = (value: object) => value;\n\nexport const listedSection = declareSection({ name: 'listed' });\n",
      ),
    ).toEqual([]);
  });

  test("report a definer its domain's entry does not export, never a schema", async () => {
    const lint = await createLinter();

    const definer = "export function define$Config() {}\n";

    expect(
      await lint(
        "src/project/unlisted/config/defineUnlistedConfig.ts",
        definer.replace("$", "Unlisted"),
      ),
    ).toEqual(["roles/config/definers/definer-entries"]);

    expect(
      await lint(
        "src/project/listed/config/defineListedConfig.ts",
        definer.replace("$", "Listed"),
      ),
    ).toEqual([]);

    expect(
      await lint(
        "src/project/unlisted/config/schemas/unlistedSchema.ts",
        "export const unlistedSchema = 1;\n",
      ),
    ).toEqual([]);
  });

  test("let an extension import statically only types and its constants, and load only its own modules", async () => {
    const { messageIds } = await createLinter();

    const file = "src/project/listed/extension.ts";
    const section = "#project/listed/config/sections/listedSection";

    expect(
      await messageIds(file, `import { listedSection } from "${section}";\n`),
    ).toEqual(["staticImport"]);

    expect(
      await messageIds(
        file,
        `import type { listedSection } from "${section}";\nimport { listed } from "#project/listed/constants";\n\nexport default { listed };\n`,
      ),
    ).toEqual([]);

    expect(
      await messageIds(
        file,
        'import inner from "./inner/extension.ts";\n\nexport default inner;\n',
      ),
    ).toEqual(["staticImport"]);

    expect(
      await messageIds(
        file,
        `export default { load: () => import("${section}") };\n`,
      ),
    ).toEqual([]);

    expect(
      await messageIds(
        file,
        'export default { load: () => import("#project/unlisted/index") };\n',
      ),
    ).toEqual(["foreignImport"]);

    expect(
      await messageIds(
        file,
        'export default { load: () => import("#project/listed/missing") };\n',
      ),
    ).toEqual(["foreignImport"]);
  });
});
