import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { syncPrettierignoreFile } from "@auaust/engrenage/prettier";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

describe("syncPrettierignoreFile", () => {
  test("writes the default and project groups, with the changelog of changesets projects", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { files: { generated: ["src/generated/**"] } };\n',
      "package.json": JSON.stringify({
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

    syncPrettierignoreFile({
      config,
    });

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
        "# ESLint suppressions",
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
        "",
        "# @end",
        "",
      ].join("\n"),
    );
  });

  test("leaves a file without markers untouched", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": "{}",
      ".prettierignore": "pnpm-lock.yaml\n",
    });

    expect(
      syncPrettierignoreFile({
        config: await loadConfig(project.root),
        check: true,
      }),
    ).toEqual([]);
  });
});
