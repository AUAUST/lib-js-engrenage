import { createSyncCommand } from "@auaust/engrenage/agents";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const emptyBlock = [
  "<!-- engrenage:sections/precedence -->",
  "<!-- /engrenage:sections/precedence -->",
  "",
].join("\n");

let root: string;

async function runSync(...args: string[]) {
  await createSyncCommand().parseAsync(["--root", root, ...args], {
    from: "user",
  });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "engrenage-agents-"));

  writeFileSync(join(root, "AGENTS.md"), emptyBlock);

  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  rmSync(root, {
    recursive: true,
    force: true,
  });

  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("createSyncCommand", () => {
  test("fills the blocks so a later check passes", async () => {
    await runSync();

    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toContain(
      "## Precedence and conflicts",
    );

    await runSync("--check");

    expect(process.exitCode).toBeUndefined();
  });

  test("fails the check without writing outdated files", async () => {
    await runSync("--check");

    expect(process.exitCode).toBe(1);
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe(emptyBlock);
  });
});
