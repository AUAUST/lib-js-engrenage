import { execFileSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { vi } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { runSync } from "#project/sync/index";
import { settleChanges } from "#project/sync/operations/settleChanges";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";

const repositoryModules = fileURLToPath(
  new URL("../../node_modules", import.meta.url),
);

async function syncProject(root: string) {
  const config = await loadConfig(root);

  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  try {
    await runSync(config);

    await settleChanges(config, { check: false });
  } finally {
    info.mockRestore();
    loadConfig.refresh(root);
  }
}

export async function createGitRepository(
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

  await syncProject(project.root);

  git("init", "--quiet");
  git("add", "-A");

  if (git("ls-files", "--stage").includes("160000 ")) {
    throw new Error("The test repository staged an embedded repository.");
  }

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
