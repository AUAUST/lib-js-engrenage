import { existsSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import sync from "#bin/engrenage/sync";
import { createTemporaryProject } from "#tests/helpers/createTemporaryProject";
import { mockCwd } from "#tests/helpers/mockCwd";
import { runCommand } from "#tests/helpers/runCommand";

const emptyBlock = [
  "<!-- @reference ./.claude/shared.md -->",
  "<!-- @end -->",
  "",
].join("\n");

function createProject() {
  const project = createTemporaryProject({
    "engrenage.config.ts": "export default {};\n",
    "package.json": JSON.stringify({
      devDependencies: {
        prettier: "*",
      },
    }),
    ".vscode/settings.json": "{}\n",
    ".claude/shared.md": "## Shared section\n",
    "AGENTS.md": emptyBlock,
  });

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("engrenage sync", () => {
  test("syncs every target so a later check passes", async () => {
    const project = createProject();

    await runCommand(sync);

    expect(project.read("AGENTS.md")).toContain("## Shared section");
    expect(project.read(".vscode/settings.json")).toContain(
      '"editor.formatOnSave": true',
    );

    await runCommand(sync, "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("checks only the selected targets without writing", async () => {
    const project = createProject();

    await runCommand(sync, "vscode", "--check");

    expect(process.exitCode).toBe(1);
    expect(console.info).toHaveBeenCalledExactlyOnceWith(
      "outdated: .vscode/settings.json",
    );
    expect(project.read("AGENTS.md")).toBe(emptyBlock);
  });

  test("creates a missing VS Code file only when its flag is passed", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": "export default {};\n",
      "package.json": '{ "devDependencies": { "prettier": "*" } }',
    });

    mockCwd(project.root);

    await runCommand(sync, "vscode");

    expect(existsSync(project.resolve(".vscode/settings.json"))).toBe(false);

    await runCommand(sync, "vscode", "--vscode-settings");

    expect(JSON.parse(project.read(".vscode/settings.json"))).toMatchObject({
      "editor.formatOnSave": true,
    });
    expect(existsSync(project.resolve(".vscode/extensions.json"))).toBe(false);
  });
});
