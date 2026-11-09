import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { syncPrettierignoreFile } from "@auaust/engrenage/prettier";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

describe("syncPrettierignoreFile", () => {
  test("writes the default and project groups, with the changelog of changesets projects and the Codex instructions", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts":
        'export default { src: { generated: "generated/**" }, agents: { preferred: ["codex"] } };\n',
      "package.json": JSON.stringify({
        type: "module",
        devDependencies: {
          "@changesets/cli": "*",
          "eslint": "*",
          "prettier": "*",
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

    await syncPrettierignoreFile(config);

    await config.context.filesystem.flush();

    expect(project.read(".prettierignore")).toBe(
      [
        "# @ignore defaults",
        "",
        "# Package locks",
        "package-lock.json",
        "yarn.lock",
        "bun.lock",
        "bun.lockb",
        "",
        "# @ignore project",
        "",
        "# Output",
        "/dist",
        "",
        "# Coverage",
        "/coverage",
        "",
        "# Codex",
        "/AGENTS.override.md",
        "",
        "# Changelog",
        "/**/CHANGELOG.md",
        "",
        "# ESLint",
        "/eslint-suppressions.json",
        "",
        "# pnpm",
        "/pnpm-lock.yaml",
        "",
        "# Codegen",
        "/src/generated/**",
        "",
        "# @end",
        "",
      ].join("\n"),
    );
  });

  test("leaves out the changelog without changesets and the Codex instructions when Codex is not preferred", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": JSON.stringify({
        type: "module",
        devDependencies: { prettier: "*" },
      }),
      ".prettierignore": "# @ignore project\n# @end\n",
    });

    const config = await loadConfig(project.root);

    await syncPrettierignoreFile(config);

    await config.context.filesystem.flush();

    const content = project.read(".prettierignore");

    expect(content).not.toContain("# Changelog");
    expect(content).not.toContain("/AGENTS.override.md");
    expect(content).toContain("# pnpm\n/pnpm-lock.yaml");
  });

  test("leaves a file without markers untouched", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": JSON.stringify({
        type: "module",
        devDependencies: { prettier: "*" },
      }),
      ".prettierignore": "pnpm-lock.yaml\n",
    });

    const config = await loadConfig(project.root);

    await syncPrettierignoreFile(config);

    expect(config.context.filesystem.changes()).toEqual([]);
  });
});
