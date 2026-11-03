import { afterEach, describe, expect, test, vi } from "vitest";

import { resolveLatestPnpm } from "#pnpm/utils/resolveLatestPnpm";
import { pnpm } from "#scripts/support/pnpm";
import { readSharedPnpmRange } from "#support/packageJson/utils/readSharedPnpmRange";
import { runCommand } from "#tests/helpers/runCommand";

vi.mock("#pnpm/utils/resolveLatestPnpm");

afterEach(() => {
  vi.restoreAllMocks();
  process.exitCode = undefined;
});

function bump(part: "major" | "minor" | "patch", by = 1): string {
  const [major = 0, minor = 0, patch = 0] = readSharedPnpmRange()
    .floor.split(".")
    .map(Number);

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
      vi.mocked(resolveLatestPnpm).mockReturnValue(newest);

      const logs = {
        info: vi.spyOn(console, "info").mockImplementation(() => {}),
        warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
        error: vi.spyOn(console, "error").mockImplementation(() => {}),
      };

      await runCommand(pnpm, "--check");

      expect(logs[level]).toHaveBeenCalledOnce();
      expect(process.exitCode === 1).toBe(fails);
    },
  );
});
