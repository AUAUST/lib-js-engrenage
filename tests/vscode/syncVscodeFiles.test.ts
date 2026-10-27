import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { syncVscodeFiles } from "@auaust/engrenage/vscode";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

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
      "package.json": packageJson,
      ".vscode/settings.json": settings,
    });

    const config = await loadConfig(project.root);

    syncVscodeFiles(config);

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
  "eslint.rules.customizations": [
    {
      "rule": "unused-imports/no-unused-vars",
      "severity": "info"
    }
  ],
  "js/ts.tsdk.path": "node_modules/typescript/lib"
}
`);

    syncVscodeFiles(config);

    expect(config.filesystem.discard()).toEqual([]);
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

    syncVscodeFiles(config);

    expect(config.filesystem.discard()).toEqual([
      {
        file: ".vscode/extensions.json",
        status: "synced",
      },
    ]);

    syncVscodeFiles(config);

    config.filesystem.flush();

    expect(project.read(".vscode/settings.json")).toBe(settings);

    expect(JSON.parse(project.read(".vscode/extensions.json"))).toEqual({
      recommendations: ["dbaeumer.vscode-eslint"],
    });
  });
});
