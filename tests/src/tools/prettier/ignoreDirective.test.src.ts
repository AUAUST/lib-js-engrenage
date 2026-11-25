import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";

async function syncProjectGroup(engrenageConfig: string): Promise<string> {
  const project = createTemporaryProject({
    "engrenage.config.ts": engrenageConfig,
    "package.json": JSON.stringify({
      type: "module",
      devDependencies: { prettier: "*" },
    }),
    ".prettierignore": "# @ignore project\n# @end\n",
  });

  const config = await loadConfig(project.root);

  await runSync(config, { names: ["blocks"] });

  await config.context.filesystem.flush();

  return project.read(".prettierignore");
}

describe("ignore directive", () => {
  test("writes the default and project groups, with the changelog of changesets projects", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { src: { generated: "generated/**" }, agents: { preferred: ["claude"] } };\n',
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

    await runSync(config, { names: ["blocks"] });

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
        "# Sync record",
        "/.engrenage/sync.json",
        "",
        "# Changelog",
        "/**/CHANGELOG.md",
        "",
        "# ESLint",
        "/eslint-suppressions.json",
        "",
        "# Agent stats",
        "/.ai/stats",
        "",
        "# Agent records",
        "/.ai/friction.md",
        "/.ai/discarded.md",
        "/.ai/backlog/*.yml",
        "/.ai/friction.yml",
        "/.ai/discarded.yml",
        "/.ai/pending.yml",
        "/.ai/missing.yml",
        "",
        "# Agent rules",
        "/.claude/rules/project-map.md",
        "/.claude/rules/project-map/**/*.md",
        "",
        "# pnpm",
        "/pnpm-lock.yaml",
        "",
        "# Linked checkouts",
        "/.engrenage/links.json",
        "",
        "# Codegen",
        "/src/generated/**",
        "",
        "# @end",
        "",
      ].join("\n"),
    );
  });

  test("leaves out the changelog without changesets", async () => {
    const content = await syncProjectGroup("export default {};\n");

    expect(content).not.toContain("# Changelog");
    expect(content).toContain("# pnpm\n/pnpm-lock.yaml");
  });

  test("ignores a custom cache directory", async () => {
    const content = await syncProjectGroup(
      'export default { cache: { dir: ".cache" } };\n',
    );

    expect(content).toContain("# Cache\n/.cache\n");
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

    await runSync(config, { names: ["blocks"] });

    expect(config.context.filesystem.changes()).toEqual([]);
  });
});
