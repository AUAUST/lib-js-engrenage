import { existsSync } from "node:fs";

import { afterEach, describe, expect, test, vi } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { linkSourcePackage } from "#tests/utils/linkSourcePackage";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

import sync from "#bin/engrenage/sync";

const emptyBlock = [
  "<!-- @reference ./.claude/shared.md -->",
  "<!-- @end -->",
  "",
].join("\n");

function createProject() {
  const project = createTemporaryProject({
    "engrenage.config.ts": 'export default { src: { baseline: "2026-10" }, agents: { preferred: ["claude"] } };\n',
    "package.json": JSON.stringify({
      type: "module",
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe("engrenage sync", () => {
  test("syncs every target so a later check passes", async () => {
    const project = createProject();

    await runCommand("sync", sync);

    expect(project.read("AGENTS.md")).toContain("## Shared section");

    expect(project.read(".vscode/settings.json")).toContain(
      '"editor.formatOnSave": true',
    );

    const { messages } = await runCommand("sync", sync, "--check");

    expect(process.exitCode).toBeUndefined();

    expect(messages.at(0)).toStrictEqual({
      level: "info",
      text: "Checking synced files...",
      data: undefined,
    });

    expect(messages.at(-1)?.text).toBe("All good!");
  });

  test("reports the agent findings of a check to the run's reporter", async () => {
    createProject();

    await runCommand("sync", sync);

    const { messages } = await runCommand("sync", sync, "--check");

    const findings = messages.filter(({ text }) => {
      return text.startsWith("claude · ");
    });

    expect(findings).not.toEqual([]);

    expect(findings.some(({ level }) => level === "log")).toBe(false);
  });

  test("checks only the selected targets and the fill targets without writing", async () => {
    const project = createProject();

    const { messages } = await runCommand("sync", sync, "vscode", "--check");

    expect(process.exitCode).toBe(1);

    expect(messages.map(({ text }) => text)).toEqual([
      "Checking synced files...",
      "outdated: .vscode/settings.json",
      "outdated: AGENTS.md",
    ]);

    expect(project.read("AGENTS.md")).toBe(emptyBlock);
  });

  test("creates a missing VS Code file only when its flag is passed", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { src: { baseline: "2026-10" }, agents: { preferred: ["claude"] } };\n',
      "package.json": '{ "type": "module", "devDependencies": { "prettier": "*" } }',
    });

    mockCwd(project.root);

    await runCommand("sync", sync, "vscode");

    expect(existsSync(project.resolve(".vscode/settings.json"))).toBe(false);

    await runCommand("sync", sync, "vscode", "--vscode-settings");

    expect(JSON.parse(project.read(".vscode/settings.json"))).toMatchObject({
      "editor.formatOnSave": true,
    });

    expect(existsSync(project.resolve(".vscode/extensions.json"))).toBe(false);
  });

  test("writes the output directory of a tsconfig created in the same pass", async () => {
    const project = createTemporaryProject({
      "engrenage.config.ts": 'export default { preset: "library", src: { baseline: "2026-10" }, agents: { preferred: [] } };\n',
      "package.json": JSON.stringify({
        name: "@scope/library",
        type: "module",
        devDependencies: { prettier: "*" },
      }),
      ".gitignore": "# @ignore project\n# @end\n",
      ".prettierignore": "# @ignore project\n# @end\n",
    });

    linkSourcePackage(project.resolve("node_modules/@auaust/engrenage"));

    mockCwd(project.root);

    await runCommand("sync", sync);

    expect(existsSync(project.resolve("tsconfig.json"))).toBe(true);
    expect(project.read(".gitignore")).toContain("/dist");
    expect(project.read(".prettierignore")).toContain("/dist");
  });
});
