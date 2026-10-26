import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import sync from "#bin/engrenage/agents/sync";
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
    ".claude/shared.md": "## Shared section\n",
    "AGENTS.md": emptyBlock,
  });

  mockCwd(project.root);

  return project;
}

beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("engrenage agents sync", () => {
  test("fills the blocks so a later check passes", async () => {
    const project = createProject();

    await runCommand(sync);

    expect(project.read("AGENTS.md")).toContain("## Shared section");

    await runCommand(sync, "--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("fails the check without writing outdated files", async () => {
    const project = createProject();

    await runCommand(sync, "--check");

    expect(process.exitCode).toBe(1);
    expect(project.read("AGENTS.md")).toBe(emptyBlock);
  });
});
