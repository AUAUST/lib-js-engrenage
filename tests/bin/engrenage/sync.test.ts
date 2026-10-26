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
    "engrenage.config.ts": "export default { vscode: { settings: true } };\n",
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
    expect(project.read(".vscode/settings.json")).toBe("{}\n");

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
});
