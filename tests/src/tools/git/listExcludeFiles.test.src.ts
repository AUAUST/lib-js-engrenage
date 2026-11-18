import { execFileSync } from "node:child_process";

import { beforeEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { listExcludeFiles } from "#tools/git/operations/listExcludeFiles";

function createRepository() {
  const project = createTemporaryProject({ "src/index.ts": "export {};\n" });

  execFileSync("git", ["init", "--quiet"], {
    cwd: project.root,
    stdio: "pipe",
  });

  project.write(".git/info/exclude", "scratch/\n");

  return project;
}

describe("listExcludeFiles", () => {
  let home: ReturnType<typeof createTemporaryProject>;

  beforeEach(() => {
    home = createTemporaryProject({ gitconfig: "" });

    vi.stubEnv("GIT_CONFIG_GLOBAL", home.resolve("gitconfig"));
    vi.stubEnv("XDG_CONFIG_HOME", home.resolve("xdg"));

    return () => {
      vi.unstubAllEnvs();
    };
  });

  test("lists the info exclude and the configured excludes file", async () => {
    const project = createRepository();

    home.write("excludes", "tmp/\n");

    execFileSync(
      "git",
      ["config", "core.excludesFile", home.resolve("excludes")],
      { cwd: project.root, stdio: "pipe" },
    );

    expect(await listExcludeFiles(project.root)).toEqual([
      project.resolve(".git/info/exclude"),
      home.resolve("excludes"),
    ]);
  });

  test("falls back to the XDG excludes file, and lists nothing outside a repository", async () => {
    const project = createRepository();

    home.write("xdg/git/ignore", "tmp/\n");

    expect(await listExcludeFiles(project.root)).toEqual([
      project.resolve(".git/info/exclude"),
      home.resolve("xdg/git/ignore"),
    ]);

    const outside = createTemporaryProject({ "a.ts": "\n" });

    expect(await listExcludeFiles(outside.root)).toEqual([]);
  });
});
