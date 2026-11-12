import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import { array, literal, looseObject, strictObject, string } from "valibot";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { validate } from "@auaust/engrenage/options/internals";
import { syncVscodeFiles } from "@auaust/engrenage/vscode";
import { map } from "@auaust/primitive-kit/arrays";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";

const eslintEntry = fileURLToPath(
  new URL("../../../../src/tools/eslint/index.ts", import.meta.url),
);

function schemaUrl(root: string, name: string): string {
  return `./${relative(root, fileURLToPath(new URL(`../../../../data/schemas/${name}.schema.json`, import.meta.url)))}`;
}

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

    expect(await config.context.filesystem.flush()).toEqual([
      {
        file: ".vscode/settings.json",
        status: "synced",
      },
    ]);

    expect(project.read(".vscode/settings.json")).toBe(String.raw`{
  // Kept by the project.
  "editor.codeActionsOnSave": {
    "source.addMissingImports": "explicit",
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never",
    "source.sortImports": "never"
  },
  "files.eol": "\n",
  "eslint.rules.customizations": [],
  "js/ts.preferences.importModuleSpecifier": "non-relative",
  "js/ts.tsdk.path": "node_modules/typescript/lib",
  "json.schemas": [
    {
      "fileMatch": [
        "**/.namespace.json"
      ],
      "url": "${schemaUrl(project.root, "namespace")}"
    },
    {
      "fileMatch": [
        "**/.domain.json"
      ],
      "url": "${schemaUrl(project.root, "domain")}"
    }
  ]
}
`);

    await syncVscodeFiles(config);

    expect(config.context.filesystem.discard()).toEqual([]);
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

    await config.context.filesystem.flush();

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

  test("keeps the project's own rule customizations beside the synced ones", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "eslint.config.ts": `import { defineEslintConfig } from ${JSON.stringify(eslintEntry)};

export default defineEslintConfig({}, {
  rules: {
    "no-console": "info",
  },
});
`,
      "package.json": packageJson,
      ".vscode/settings.json": `{
  "eslint.rules.customizations": [
    { "rule": "no-console", "severity": "warn" },
    { "rule": "project/own", "severity": "off" }
  ]
}
`,
    });

    mockCwd(project.root);

    const config = await loadConfig(project.root);

    await syncVscodeFiles(config);

    await config.context.filesystem.flush();

    const settings = validate(
      looseObject({
        "eslint.rules.customizations": array(
          strictObject({
            rule: string(),
            severity: string(),
          }),
        ),
      }),
      JSON.parse(project.read(".vscode/settings.json")),
      "VS Code settings",
    );

    const customizations = settings["eslint.rules.customizations"];

    expect(customizations.slice(0, 2)).toEqual([
      {
        rule: "no-console",
        severity: "warn",
      },
      {
        rule: "project/own",
        severity: "off",
      },
    ]);

    expect(customizations).toContainEqual({
      rule: "auaust/no-unused-vars",
      severity: "info",
    });

    await syncVscodeFiles(config);

    expect(config.context.filesystem.discard()).toEqual([]);
  });

  test("maps the metadata files to their schemas beside the project's own", async () => {
    const own = {
      fileMatch: ["*.own.json"],
      url: "./own.schema.json",
    };

    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": packageJson,
      ".vscode/settings.json": JSON.stringify({
        "json.schemas": [own],
      }),
    });

    const config = await loadConfig(project.root);

    await syncVscodeFiles(config);

    await config.context.filesystem.flush();

    const settings = validate(
      looseObject({
        "json.schemas": array(
          strictObject({ fileMatch: array(string()), url: string() }),
        ),
      }),
      JSON.parse(project.read(".vscode/settings.json")),
      "VS Code settings",
    );

    expect(settings["json.schemas"]).toEqual([
      own,
      {
        fileMatch: ["**/.namespace.json"],
        url: schemaUrl(project.root, "namespace"),
      },
      {
        fileMatch: ["**/.domain.json"],
        url: schemaUrl(project.root, "domain"),
      },
    ]);
  });

  test("updates existing enabled files and skips disabled or missing ones", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default { vscode: { settings: false } };\n",
      "package.json": packageJson,
      ".vscode/settings.json": settings,
      ".vscode/extensions.json": "{}\n",
    });

    const config = await loadConfig(project.root);

    await syncVscodeFiles(config);

    expect(config.context.filesystem.discard()).toEqual([
      {
        file: ".vscode/extensions.json",
        status: "synced",
      },
    ]);

    await syncVscodeFiles(config);

    await config.context.filesystem.flush();

    expect(project.read(".vscode/settings.json")).toBe(settings);

    expect(JSON.parse(project.read(".vscode/extensions.json"))).toEqual({
      recommendations: ["dbaeumer.vscode-eslint"],
    });
  });
});
