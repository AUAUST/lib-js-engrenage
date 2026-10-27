import { fileURLToPath } from "node:url";

import { array, literal, looseObject, strictObject, string } from "valibot";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { syncVscodeFiles } from "@auaust/engrenage/vscode";
import { map } from "@auaust/primitive-kit/arrays";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { validate } from "#utils/validate";

const eslintEntry = fileURLToPath(
  new URL("../../src/eslint/index.ts", import.meta.url),
);

const packageJson = JSON.stringify({
  type: "module",
  devDependencies: {
    eslint: "*",
    typescript: "*",
  },
});

const settings = `{
  // Kept by the project.
  "editor.codeActionsOnSave": {
    "source.addMissingImports": "explicit"
  },
  "files.eol": "\\n",
  "typescript.tsdk": "node_modules/typescript/lib"
}
`;

describe("syncVscodeFiles", () => {
  test("merges the settings of the declared tools into an existing file", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "eslint.config.ts": "export default [];\n",
      "package.json": packageJson,
      ".vscode/settings.json": settings,
    });

    const config = await loadConfig(project.root);

    await syncVscodeFiles(config);

    expect(config.filesystem.flush()).toEqual([
      {
        file: ".vscode/settings.json",
        status: "synced",
      },
    ]);

    expect(project.read(".vscode/settings.json")).toBe(`{
  // Kept by the project.
  "editor.codeActionsOnSave": {
    "source.addMissingImports": "explicit",
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never",
    "source.sortImports": "never"
  },
  "files.eol": "\\n",
  "eslint.rules.customizations": [],
  "js/ts.tsdk.path": "node_modules/typescript/lib"
}
`);

    await syncVscodeFiles(config);

    expect(config.filesystem.discard()).toEqual([]);
  });

  test("shows the rules the ESLint config declares as info at info severity", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "eslint.config.ts": `import { defineEslintConfig } from ${JSON.stringify(eslintEntry)};

export default defineEslintConfig({}, {
  rules: {
    "no-console": "info",
    "auaust/naming-convention": "error",
  },
});
`,
      "package.json": packageJson,
    });

    mockCwd(project.root);

    const config = await loadConfig(project.root);

    await syncVscodeFiles(config, {
      settings: true,
    });

    config.filesystem.flush();

    const settings = validate(
      looseObject({
        "eslint.rules.customizations": array(
          strictObject({
            rule: string(),
            severity: literal("info"),
          }),
        ),
      }),
      JSON.parse(project.read(".vscode/settings.json")),
      "VS Code settings",
    );

    const rules = map(settings["eslint.rules.customizations"], ({ rule }) => {
      return rule;
    });

    expect(rules).toContain("no-console");

    expect(rules).toContain("auaust/no-unused-vars");

    expect(rules).not.toContain("auaust/naming-convention");
  });

  test("updates existing enabled files and skips disabled or missing ones", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        "export default { vscode: { settings: false } };\n",
      "package.json": packageJson,
      ".vscode/settings.json": settings,
      ".vscode/extensions.json": "{}\n",
    });

    const config = await loadConfig(project.root);

    await syncVscodeFiles(config);

    expect(config.filesystem.discard()).toEqual([
      {
        file: ".vscode/extensions.json",
        status: "synced",
      },
    ]);

    await syncVscodeFiles(config);

    config.filesystem.flush();

    expect(project.read(".vscode/settings.json")).toBe(settings);

    expect(JSON.parse(project.read(".vscode/extensions.json"))).toEqual({
      recommendations: ["dbaeumer.vscode-eslint"],
    });
  });
});
