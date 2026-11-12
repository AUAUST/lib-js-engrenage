import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/extensions";
import { syncGitignoreFile } from "@auaust/engrenage/git";
import { defaultIgnores } from "@auaust/engrenage/git/constants";
import { map } from "@auaust/primitive-kit/arrays";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getFixture } from "#tests/utils/getFixture";

describe("syncGitignoreFile", () => {
  test("writes each preset as a titled group and keeps the lines around the blocks", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
        },
      }),
      ".gitignore": [
        "# @ignore env",
        "stale",
        "# @ignore project",
        "# @end",
        "",
        ".local-notes",
        "",
      ].join("\n"),
    });

    const config = await loadConfig(project.root);

    await syncGitignoreFile(config);

    expect(await config.context.filesystem.flush()).toEqual([
      {
        file: ".gitignore",
        status: "synced",
      },
    ]);

    expect(project.read(".gitignore")).toBe(
      [
        "# @ignore env",
        "",
        "# Environment",
        ".env",
        ".env.*",
        "!.env.example",
        "",
        "# @ignore project",
        "",
        "# Output",
        "/dist",
        "",
        "# Coverage",
        "/coverage",
        "",
        "# @end",
        "",
        ".local-notes",
        "",
      ].join("\n"),
    );

    await syncGitignoreFile(config);

    expect(config.context.filesystem.discard()).toEqual([]);
  });

  test("ignores a custom cache directory, covering the caches inside it", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { cache: { dir: ".cache" } };\n',
      "package.json": JSON.stringify({
        type: "module",
        devDependencies: {
          jscpd: "*",
        },
      }),
      "tsconfig.json": JSON.stringify({
        compilerOptions: {
          outDir: "dist",
        },
      }),
      ".gitignore": "# @ignore project\n# @end\n",
    });

    const config = await loadConfig(project.root);

    await syncGitignoreFile(config);

    await config.context.filesystem.flush();

    expect(project.read(".gitignore")).toBe(
      [
        "# @ignore project",
        "",
        "# Output",
        "/dist",
        "",
        "# Cache",
        "/.cache",
        "",
        "# Coverage",
        "/coverage",
        "",
        "# @end",
        "",
      ].join("\n"),
    );
  });

  test("ignores the uncommitted files of a listed extension after the built-ins", async () => {
    const config = await loadConfig(getFixture("projects/external"), {
      searchParents: false,
    });

    await syncGitignoreFile(config);

    const staged = await config.context.filesystem.read(".gitignore");

    config.context.filesystem.discard();

    expect(staged).toBe(
      [
        "# @ignore project",
        "",
        "# Coverage",
        "/coverage",
        "",
        "# External fixture",
        "/external-output",
        "",
        "# @end",
        "",
      ].join("\n"),
    );
  });

  test("expands defaults into every fixed group, in order", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
      ".gitignore": "# @ignore defaults\n# @end\n",
    });

    const config = await loadConfig(project.root);

    await syncGitignoreFile(config);

    await config.context.filesystem.flush();

    const lines = project.read(".gitignore").split("\n");

    const titles = lines.filter((line) => {
      return line.startsWith("# ") && !line.startsWith("# @");
    });

    expect(titles).toEqual(
      map(defaultIgnores, ({ title }) => {
        return `# ${title}`;
      }),
    );
  });

  test("ignores agent worktrees by default", () => {
    expect(
      defaultIgnores.flatMap(({ globs }) => {
        return globs;
      }),
    ).toContain(".claude/worktrees");
  });

  test("rejects an unknown preset, naming the marker and the file", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
      ".gitignore": "# @ignore python\n# @end\n",
    });

    const config = await loadConfig(project.root);

    await expect(async () => {
      await syncGitignoreFile(config);
    }).rejects.toThrow(
      'Unknown preset in "# @ignore python" of .gitignore, expected one of: javascript, lockfiles, os, env, logs, editors, defaults, project',
    );
  });
});
