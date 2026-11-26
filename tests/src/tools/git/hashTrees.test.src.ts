import { execFileSync } from "node:child_process";

import { describe, expect, test } from "vitest";

import { createGitRepository } from "#tests/utils/createGitRepository";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { hashTrees } from "#tools/git/operations/hashTrees";

describe("hashTrees", () => {
  test("hashes the worktree without its excluded files", async () => {
    const { project, git } = await createGitRepository(
      {
        "package.json": '{"type":"module"}',
        ".gitignore": "node_modules\n",
      },
      [],
    );

    const { selected, worktree: tree } = await hashTrees(project.root, {
      mode: "worktree",
    });

    expect(selected).toBe(tree);

    project.write("draft.md", "draft\n");
    project.write("package.json", '{"type":"commonjs"}');

    const exclude = ["draft.md", "package.json"];

    const hashes = await hashTrees(project.root, { mode: "worktree", exclude });

    expect(hashes.worktree).toBe(tree);

    expect(hashes.selected).not.toBe(tree);

    expect(git("status", "--porcelain")).toContain("?? draft.md");
  });

  test("hashes the index as the staged selection, apart from the worktree", async () => {
    const { project, git } = await createGitRepository(
      {
        "package.json": '{"type":"module"}',
        ".gitignore": "node_modules\n",
      },
      [],
    );

    project.write("staged.md", "staged\n");

    git("add", "staged.md");

    const index = git("write-tree").trim();

    project.write("unstaged.md", "unstaged\n");

    const hashes = await hashTrees(project.root, {
      mode: "staged",
      exclude: ["unstaged.md"],
    });

    expect(hashes).toEqual({ selected: index, worktree: index });

    const staged = await hashTrees(project.root, { mode: "staged" });

    expect(staged.selected).toBe(index);

    expect(staged.worktree).not.toBe(index);

    expect(git("write-tree").trim()).toBe(index);
  });

  test("hashes the included ignored files in both modes", async () => {
    const { project } = await createGitRepository(
      {
        "package.json": '{"type":"module"}',
        ".gitignore": "node_modules\ngenerated.ts\n",
        "generated.ts": "export {};\n",
      },
      [],
    );

    const include = ["generated.ts"];

    const hashes = await hashTrees(project.root, { mode: "staged", include });

    const { selected } = await hashTrees(project.root, { mode: "staged" });

    expect(hashes.selected).not.toBe(selected);

    project.write("generated.ts", "export const value = 1;\n");

    const changed = await hashTrees(project.root, { mode: "staged", include });

    expect(changed.selected).not.toBe(hashes.selected);

    expect(changed.worktree).not.toBe(hashes.worktree);
  });

  test("keeps an included file in the worktree hash even when excluded", async () => {
    const { project } = await createGitRepository(
      {
        "package.json": '{"type":"module"}',
        ".gitignore": "node_modules\ngenerated.ts\n",
        "generated.ts": "export {};\n",
      },
      [],
    );

    const include = ["generated.ts"];

    const { worktree } = await hashTrees(project.root, {
      mode: "worktree",
      include,
    });

    expect(
      await hashTrees(project.root, {
        mode: "worktree",
        exclude: include,
        include,
      }),
    ).toEqual({ selected: worktree, worktree });
  });

  test("excludes files on an unborn branch", async () => {
    const project = createTemporaryProject({ "a.md": "a\n" });

    execFileSync("git", ["init", "--quiet"], {
      cwd: project.root,
      stdio: "pipe",
    });

    const { worktree: tree } = await hashTrees(project.root, {
      mode: "worktree",
    });

    project.write("draft.md", "draft\n");

    const { worktree } = await hashTrees(project.root, {
      mode: "worktree",
      exclude: ["draft.md"],
    });

    expect(worktree).toBe(tree);
  });
});
