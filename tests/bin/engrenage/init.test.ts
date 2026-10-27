import { spawnSync } from "node:child_process";
import { mkdirSync, symlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { keys } from "@auaust/toolkit/object";

import init from "#bin/engrenage/init";
import manifest from "#package.json" with { type: "json" };
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

vi.mock(import("node:child_process"));

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));

function createProject(files: Record<string, string>) {
  const project = createTemporaryProject(files);

  mkdirSync(project.resolve("node_modules/@auaust"), {
    recursive: true,
  });

  symlinkSync(
    repositoryRoot,
    project.resolve("node_modules/@auaust/engrenage"),
  );

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});

  vi.mocked(spawnSync).mockReturnValue({
    pid: 0,
    output: [],
    stdout: "",
    stderr: "",
    status: 0,
    signal: null,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("engrenage init", () => {
  test("fills the gaps of a configured project, installs added dependencies and syncs", async () => {
    const project = createProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
      ".gitignore": "node_modules\n.DS_Store\n\n# Scratch\n/scratch\n",
    });

    await runCommand(init, "--yes");

    const packageJson: unknown = JSON.parse(project.read("package.json"));

    expect(packageJson).toMatchObject({
      prettier: "@auaust/engrenage/prettier",
      devDependencies: {
        "@auaust/engrenage": `^${manifest.version}`,
        "eslint": manifest.peerDependencies.eslint,
        "prettier": manifest.peerDependencies.prettier,
        "typescript": manifest.peerDependencies.typescript,
        "@changesets/cli": manifest.peerDependencies["@changesets/cli"],
      },
    });
    expect(spawnSync).toHaveBeenCalledExactlyOnceWith("pnpm", ["install"], {
      cwd: project.root,
      stdio: "inherit",
    });
    expect(console.info).toHaveBeenCalledWith(
      "Run pnpm changeset init to finish the setup.",
    );
    expect(project.read("pnpm-workspace.yaml")).toBe(
      'allowBuilds:\n  "unrs-resolver": true\nminimumReleaseAgeExclude:\n  - "@auaust/*"\n',
    );

    expect(project.read("eslint.config.ts")).toContain(
      'import { defineEslintConfig } from "@auaust/engrenage/eslint";',
    );
    expect(project.read("CLAUDE.md")).toBe("@AGENTS.md\n");
    expect(project.read("AGENTS.md")).toContain("## Precedence and conflicts");
    expect(project.read(".prettierignore")).toContain("# @ignore defaults");
    expect(JSON.parse(project.read(".vscode/settings.json"))).toMatchObject({
      "editor.formatOnSave": true,
    });

    const gitignore = project.read(".gitignore");

    expect(gitignore).toMatch(
      /^# @ignore defaults\n\n# JavaScript\nnode_modules\n/,
    );
    expect(gitignore).toMatch(/# @end\n\n# Scratch\n\/scratch\n$/);
    expect(gitignore.match(/^node_modules$/gm)).toHaveLength(1);
  });

  test("leaves a complete project untouched", async () => {
    const project = createProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{\n  "name": "project",\n  "type": "module"\n}\n',
      ".changeset/config.json": "{}\n",
    });

    await runCommand(init, "--yes");

    const completed = project.read("package.json");

    vi.clearAllMocks();

    await runCommand(init, "--yes");

    expect(spawnSync).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledExactlyOnceWith(
      "Engrenage is set up, nothing is missing.",
    );
    expect(project.read("package.json")).toBe(completed);
    expect(keys(JSON.parse(completed))).toEqual([
      "name",
      "type",
      "devDependencies",
      "prettier",
    ]);
  });
});
