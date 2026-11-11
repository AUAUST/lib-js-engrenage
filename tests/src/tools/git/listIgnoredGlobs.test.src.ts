import { execFileSync } from "node:child_process";

import { describe, expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { listIgnoredGlobs } from "#tools/git/operations/listIgnoredGlobs";

function createRepository() {
  const project = createTemporaryProject({
    ".gitignore": "dist/\n*.log\nnode_modules\n",
    "src/index.ts": "export {};\n",
    "dist/index.js": "export {};\n",
    "src/new/node_modules/a.js": "\n",
    "debug.log": "\n",
    "worktrees/copy/a.test.ts": "\n",
  });

  execFileSync("git", ["init", "--quiet"], { cwd: project.root });

  project.write(".git/info/exclude", "worktrees/\n");

  return project;
}

describe("listIgnoredGlobs", () => {
  test("lists what every Git ignore source ignores, inside untracked directories too, a directory as one glob", async () => {
    const project = createRepository();

    expect(await listIgnoredGlobs(project.root, project.root)).toEqual([
      "debug.log",
      "dist/**",
      "src/new/node_modules/**",
      "worktrees/**",
    ]);
  });

  test("lists nothing outside a repository or for a base Git ignores whole", async () => {
    const project = createRepository();

    expect(
      await listIgnoredGlobs(project.root, project.resolve("worktrees/copy")),
    ).toEqual([]);

    const outside = createTemporaryProject({ "dist/index.js": "\n" });

    expect(await listIgnoredGlobs(outside.root, outside.root)).toEqual([]);
  });
});
