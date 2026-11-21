import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import { array, looseObject, strictObject, string } from "valibot";
import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { validate } from "@auaust/engrenage/options/internals";
import { syncVscodeFiles } from "@auaust/engrenage/vscode";

import { eslintPackageJson } from "#tests/constants";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

function schemaUrl(root: string, name: string): string {
  return `./${relative(root, fileURLToPath(new URL(`../../../../data/schemas/${name}.schema.json`, import.meta.url)))}`;
}

function schemaEntry(root: string, name: string) {
  return {
    fileMatch: [`**/.${name}.json`],
    url: schemaUrl(root, name),
  };
}

async function syncSchemas(
  config: Awaited<ReturnType<typeof loadConfig>>,
  read: (path: string) => string,
) {
  await syncVscodeFiles(config);

  await config.context.filesystem.flush();

  const settings = validate(
    looseObject({
      "json.schemas": array(
        strictObject({ fileMatch: array(string()), url: string() }),
      ),
    }),
    JSON.parse(read(".vscode/settings.json")),
    "VS Code settings",
  );

  return settings["json.schemas"];
}

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
      "package.json": eslintPackageJson,
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
  "eslint.codeActionsOnSave.mode": "problems",
  "eslint.options": {
    "flags": [
      "unstable_native_nodejs_ts_config"
    ]
  },
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
    },
    {
      "fileMatch": [
        "**/.workspace.json"
      ],
      "url": "${schemaUrl(project.root, "workspace")}"
    }
  ]
}
`);

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
      "package.json": eslintPackageJson,
      ".vscode/settings.json": JSON.stringify({
        "json.schemas": [own],
      }),
    });

    const config = await loadConfig(project.root);

    expect(await syncSchemas(config, project.read)).toEqual([
      own,
      schemaEntry(project.root, "namespace"),
      schemaEntry(project.root, "domain"),
      schemaEntry(project.root, "workspace"),
    ]);
  });

  test("points each metadata matcher at its current schema alone", async () => {
    const stale = "./node_modules/.pnpm/stale/schemas";

    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": eslintPackageJson,
    });

    project.write(
      ".vscode/settings.json",
      JSON.stringify({
        "json.schemas": [
          {
            fileMatch: ["**/.namespace.json"],
            url: `${stale}/namespace.schema.json`,
          },
          {
            fileMatch: ["**/.domain.json", "*.own.json"],
            url: `${stale}/domain.schema.json`,
          },
          {
            fileMatch: ["*.namespace-like.json"],
            url: schemaUrl(project.root, "namespace"),
          },
          {
            fileMatch: ["**/.domain.json"],
            url: schemaUrl(project.root, "domain"),
          },
          {
            fileMatch: ["**/.domain.json"],
            url: schemaUrl(project.root, "domain"),
          },
        ],
      }),
    );

    const config = await loadConfig(project.root);

    expect(await syncSchemas(config, project.read)).toEqual([
      {
        fileMatch: ["*.own.json"],
        url: `${stale}/domain.schema.json`,
      },
      {
        fileMatch: ["*.namespace-like.json", "**/.namespace.json"],
        url: schemaUrl(project.root, "namespace"),
      },
      schemaEntry(project.root, "domain"),
      schemaEntry(project.root, "workspace"),
    ]);

    await syncVscodeFiles(config);

    expect(config.context.filesystem.discard()).toEqual([]);
  });

  test("updates existing enabled files and skips disabled or missing ones", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default { vscode: { settings: false } };\n",
      "package.json": eslintPackageJson,
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
