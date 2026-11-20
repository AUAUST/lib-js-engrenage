import { afterEach, expect, test, vi } from "vitest";

import { hasNodeCondition } from "#foundation/processes/operations/hasNodeCondition";
import { resolveVitestArguments } from "#tools/vitest/operations/resolveVitestArguments";
import { resolveVitestWatchArguments } from "#tools/vitest/operations/resolveVitestWatchArguments";

afterEach(() => {
  vi.unstubAllEnvs();
});

test.each([
  ["--conditions=source", true],
  ["--max-old-space-size=4096 -C source", true],
  ["--conditions source", true],
  ["--conditions=development", false],
  [undefined, false],
])("reads the source condition from NODE_OPTIONS %s", (options, active) => {
  expect(hasNodeCondition("source", options)).toBe(active);
});

test("loads the Vitest config natively only under the source condition", () => {
  vi.stubEnv("NODE_OPTIONS", "--conditions=source");

  expect(resolveVitestArguments(["--", "a.test.ts"])).toEqual([
    "run",
    "--typecheck",
    "--configLoader",
    "native",
    "--",
    "a.test.ts",
  ]);

  vi.stubEnv("NODE_OPTIONS", "");

  expect(resolveVitestArguments([])).not.toContain("--configLoader");
});

test("reads a leading Vitest mode as the mode, never as a file filter", () => {
  vi.stubEnv("NODE_OPTIONS", "");

  expect(resolveVitestArguments(["run", "a.test.ts"])).toEqual([
    "run",
    "a.test.ts",
    "--typecheck",
  ]);

  expect(resolveVitestWatchArguments(["dev"])).toEqual([
    "watch",
    "--typecheck",
  ]);

  expect(() => resolveVitestArguments(["watch"])).toThrow(/watch mode/u);
});
