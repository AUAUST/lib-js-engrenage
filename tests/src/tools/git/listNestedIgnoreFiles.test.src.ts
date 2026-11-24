import { execFileSync } from "node:child_process";

import { expect, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { listNestedIgnoreFiles } from "#tools/git/operations/listNestedIgnoreFiles";

test("lists the nested ignore files Git reads, outside ignored directories, and none outside a repository", async () => {
  const project = createTemporaryProject({
    ".gitignore": "vendor/\n",
    "app/.gitignore": "*.log\n",
    "app/[id]/.gitignore": "*.tmp\n",
    "app/.cache/.gitignore": "*\n",
    "vendor/lib/.gitignore": "*\n",
  });

  expect(await listNestedIgnoreFiles(project.root, project.root)).toEqual([]);

  execFileSync("git", ["init", "--quiet"], {
    cwd: project.root,
    stdio: "pipe",
  });

  expect(await listNestedIgnoreFiles(project.root, project.root)).toEqual([
    project.resolve("app/.cache/.gitignore"),
    project.resolve("app/.gitignore"),
    project.resolve("app/[id]/.gitignore"),
  ]);

  expect(
    await listNestedIgnoreFiles(project.root, project.resolve("app")),
  ).toEqual([
    project.resolve("app/.cache/.gitignore"),
    project.resolve("app/[id]/.gitignore"),
  ]);
});
