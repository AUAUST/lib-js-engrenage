import sync from "#bin/engrenage/agents/sync";
import { Command } from "@commander-js/extra-typings";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const emptyBlock = [
  "<!-- @reference ./.claude/shared.md -->",
  "<!-- @end -->",
  "",
].join("\n");

let root: string;

async function runSync(...args: string[]) {
  await sync(new Command("sync")).parseAsync(args, {
    from: "user",
  });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "engrenage-agents-"));

  mkdirSync(join(root, ".claude"));

  writeFileSync(join(root, ".claude/shared.md"), "## Shared section\n");
  writeFileSync(join(root, "AGENTS.md"), emptyBlock);

  vi.spyOn(process, "cwd").mockReturnValue(root);
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  rmSync(root, {
    recursive: true,
    force: true,
  });

  vi.restoreAllMocks();

  process.exitCode = undefined;
});

describe("engrenage agents sync", () => {
  test("fills the blocks so a later check passes", async () => {
    await runSync();

    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toContain(
      "## Shared section",
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
