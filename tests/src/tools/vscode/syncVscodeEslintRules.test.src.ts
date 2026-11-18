import { fileURLToPath } from "node:url";

import { array, literal, looseObject, strictObject, string } from "valibot";
import { describe, expect, test } from "vitest";

import { map } from "@auaust/toolkit/array";

import { validate } from "#foundation/options/index";
import { loadConfig } from "#project/config/index";
import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { syncVscodeFiles } from "#tools/vscode/index";

const eslintEntry = fileURLToPath(
  new URL("../../../../src/tools/eslint/index.ts", import.meta.url),
);

const packageJson = JSON.stringify({
  type: "module",
  devDependencies: {
    eslint: "*",
    typescript: "*",
  },
});

describe("syncVscodeFiles", { timeout: binaryTimeout }, () => {
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
});
