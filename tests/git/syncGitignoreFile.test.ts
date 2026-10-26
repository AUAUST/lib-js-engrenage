import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";
import { syncGitignoreFile } from "@auaust/engrenage/git";
import { defaultIgnores } from "@auaust/engrenage/git/constants";
import { map } from "@auaust/primitive-kit/arrays";

import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";

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

    expect(
      syncGitignoreFile({
        config,
      }),
    ).toEqual([
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

    expect(
      syncGitignoreFile({
        config,
        check: true,
      }),
    ).toEqual([]);
  });

  test("expands defaults into every fixed group, in order", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
      ".gitignore": "# @ignore defaults\n# @end\n",
    });

    syncGitignoreFile({
      config: await loadConfig(project.root),
    });

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

  test("rejects an unknown preset, naming the marker and the file", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "type": "module" }',
      ".gitignore": "# @ignore python\n# @end\n",
    });

    const config = await loadConfig(project.root);

    expect(() => {
      return syncGitignoreFile({
        config,
      });
    }).toThrow(
      'Unknown preset in "# @ignore python" of .gitignore, expected one of: javascript, lockfiles, os, env, logs, editors, defaults, project',
    );
  });
});
