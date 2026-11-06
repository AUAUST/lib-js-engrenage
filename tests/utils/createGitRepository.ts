import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { getExecutable } from "#tests/utils/getExecutable";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";

const repositoryModules = fileURLToPath(
  new URL("../../node_modules", import.meta.url),
);

export function createGitRepository(
  files: Record<string, string>,
  modules: readonly string[],
) {
  const project = createTemporaryProject(files);

  mkdirSync(project.resolve("node_modules"));

  for (const name of modules) {
    symlinkSync(
      join(repositoryModules, name),
      project.resolve(`node_modules/${name}`),
    );
  }

  linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

  function git(...args: string[]): string {
    return execFileSync("git", args, {
      cwd: project.root,
      encoding: "utf-8",
    });
  }

  execFileSync(process.execPath, [getExecutable(), "sync"], {
    cwd: project.root,
    stdio: "ignore",
  });

  git("init", "--quiet");
  git("add", "-A");

  git(
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "--quiet",
    "-m",
    "initial",
  );

  return { project, git };
}
