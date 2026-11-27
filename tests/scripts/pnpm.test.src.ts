import { afterEach, describe, expect, test, vi } from "vitest";

import { runContext } from "#nexus/cli/operations/runContext";
import { readSharedPnpmRange } from "#project/package/utils/readSharedPnpmRange";
import { createTestReporter } from "#tests/utils/createTestReporter";
import { resolveLatestPnpm } from "#tools/pnpm/operations/resolveLatestPnpm";

import checkPnpm from "#scripts/actions/pnpm";

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

      const reporter = createTestReporter();

      await runContext.run(
        { signal: new AbortController().signal, reporter },
        () => checkPnpm({ check: true }),
      );

      const { messages } = reporter;

      expect(messages.map((message) => message.level)).toStrictEqual([level]);
      expect(process.exitCode === 1).toBe(fails);
    },
  );
});
