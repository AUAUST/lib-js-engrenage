import { describe, expect, test } from "vitest";

import { map } from "@auaust/toolkit/array";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { fillBlocks } from "#tests/utils/fillBlocks";
import { getFixture } from "#tests/utils/getFixture";
import { defaultIgnores } from "#tools/git/constants";

describe("ignore directive", () => {
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

    await runSync(config, { names: ["blocks"] });

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
        "# Agent stats",
        "/.ai/stats",
        "",
        "# @end",
        "",
        ".local-notes",
        "",
      ].join("\n"),
    );

    await runSync(config, { names: ["blocks"] });

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

    await runSync(config, { names: ["blocks"] });

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
        "# Agent stats",
        "/.ai/stats",
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

    expect(await fillBlocks(config, ".gitignore")).toBe(
      [
        "# @ignore project",
        "",
        "# Coverage",
        "/coverage",
        "",
        "# Agent stats",
        "/.ai/stats",
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

    await runSync(config, { names: ["blocks"] });

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

  test("rejects an unknown preset, naming the file and the line", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
      ".gitignore": "# @ignore python\n# @end\n",
    });

    const config = await loadConfig(project.root);

    await expect(async () => {
      await runSync(config, { names: ["blocks"] });
    }).rejects.toThrow(
      '.gitignore: line 1: Unknown preset "python", expected one of: javascript, lockfiles, os, env, logs, editors, defaults, project',
    );
  });
});
