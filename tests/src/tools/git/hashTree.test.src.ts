import { execFileSync } from "node:child_process";

import { describe, expect, test } from "vitest";

import { createGitRepository } from "#tests/utils/createGitRepository";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { hashTree } from "#tools/git/operations/hashTree";

describe("hashTree", () => {
  test("hashes the worktree without its excluded files", async () => {
    const { project, git } = await createGitRepository(
      { "package.json": '{"type":"module"}', ".gitignore": "node_modules\n" },
      [],
    );

    const tree = await hashTree(project.root, { mode: "worktree" });

    project.write("draft.md", "draft\n");
    project.write("package.json", '{"type":"commonjs"}');

    const exclude = ["draft.md", "package.json"];

    expect(await hashTree(project.root, { mode: "worktree", exclude })).toBe(
      tree,
    );

    expect(await hashTree(project.root, { mode: "worktree" })).not.toBe(tree);
    expect(git("status", "--porcelain")).toContain("?? draft.md");
  });

  test("excludes files on an unborn branch", async () => {
    const project = createTemporaryProject({ "a.md": "a\n" });

    execFileSync("git", ["init", "--quiet"], { cwd: project.root });

    const tree = await hashTree(project.root, { mode: "worktree" });

    project.write("draft.md", "draft\n");

    expect(
      await hashTree(project.root, { mode: "worktree", exclude: ["draft.md"] }),
    ).toBe(tree);
  });
});
