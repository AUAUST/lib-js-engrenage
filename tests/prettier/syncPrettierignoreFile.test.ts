import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { syncPrettierignoreFile } from "@auaust/engrenage/prettier";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

describe("syncPrettierignoreFile", () => {
  test("writes the default and project groups, with the changelog of changesets projects and the Codex instructions", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { code: { generatedFiles: "src/generated/**" }, agents: { preferred: ["codex"] } };\n',
      "package.json": JSON.stringify({
        type: "module",
        devDependencies: {
          "@changesets/cli": "*",
        },
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
        },
      }),
      ".prettierignore": "# @ignore defaults\n# @ignore project\n# @end\n",
    });

    const config = await loadConfig(project.root);

    syncPrettierignoreFile(config);

    config.filesystem.flush();

    expect(project.read(".prettierignore")).toBe(
      [
        "# @ignore defaults",
        "",
        "# Package locks",
        "pnpm-lock.yaml",
        "package-lock.json",
        "yarn.lock",
        "bun.lock",
        "bun.lockb",
        "",
        "# ESLint",
        "eslint-suppressions.json",
        "",
        "# @ignore project",
        "",
        "# Output",
        "/dist",
        "",
        "# Coverage",
        "/coverage",
        "",
        "# Changelog",
        "CHANGELOG.md",
        "",
        "# Codegen",
        "/src/generated/**",
        "/AGENTS.override.md",
        "",
        "# @end",
        "",
      ].join("\n"),
    );
  });

  test("leaves a file without markers untouched", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
      ".prettierignore": "pnpm-lock.yaml\n",
    });

    const config = await loadConfig(project.root);

    syncPrettierignoreFile(config);

    expect(config.filesystem.changes()).toEqual([]);
  });
});
