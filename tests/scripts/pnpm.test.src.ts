import { afterEach, describe, expect, test, vi } from "vitest";

import { readSharedPnpmRange } from "#project/package/utils/readSharedPnpmRange";
import { runDefinition } from "#tests/utils/runDefinition";
import { resolveLatestPnpm } from "#tools/pnpm/operations/resolveLatestPnpm";

import pnpm from "#scripts/pnpm";

vi.mock("#tools/pnpm/operations/resolveLatestPnpm");

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

function bump(part: "major" | "minor" | "patch", by = 1): string {
  const [
    major = 0,
    minor = 0,
    patch = 0,
  ] = readSharedPnpmRange().floor.split(".").map(Number);

  if (part === "major") {
    return `${major + by}.0.0`;
  }

  return part === "minor"
    ? `${major}.${minor + by}.0`
    : `${major}.${minor}.${patch + by}`;
}

describe("support pnpm", () => {
  test.each([
    ["patch", bump("patch"), "info", false],
    ["minor", bump("minor"), "warn", false],
    ["major", bump("major"), "warn", false],
    ["two majors", bump("major", 2), "error", true],
  ] as const)(
    "logs a newest pnpm one %s ahead as %s",
    async (_gap, newest, level, fails) => {
      vi.mocked(resolveLatestPnpm).mockResolvedValue(newest);

      const { messages } = await runDefinition(pnpm, "--check");

      expect(messages.map((message) => message.level)).toStrictEqual([level]);
      expect(process.exitCode === 1).toBe(fails);
    },
  );
});
