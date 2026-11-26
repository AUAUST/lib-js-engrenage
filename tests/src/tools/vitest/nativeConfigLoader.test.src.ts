import { afterEach, expect, test, vi } from "vitest";

import { hasNodeCondition } from "#foundation/processes/operations/hasNodeCondition";
import { ensureNativeConfigLoader } from "#tools/vitest/operations/ensureNativeConfigLoader";
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

test("loads the Vitest config natively whenever Node strips types", () => {
  vi.stubEnv("NODE_OPTIONS", "");

  expect(resolveVitestArguments(["--", "a.test.ts"])).toEqual([
    "run",
    "--typecheck",
    "--configLoader",
    "native",
    "--",
    "a.test.ts",
  ]);

  expect(ensureNativeConfigLoader(["run"], "strip")).toEqual([
    "run",
    "--configLoader",
    "native",
  ]);

  expect(ensureNativeConfigLoader(["run"], false)).toEqual(["run"]);
});

test("reads a leading Vitest mode as the mode, never as a file filter", () => {
  vi.stubEnv("NODE_OPTIONS", "");

  expect(resolveVitestArguments(["run", "a.test.ts"])).toEqual([
    "run",
    "a.test.ts",
    "--typecheck",
    "--configLoader",
    "native",
  ]);

  expect(resolveVitestWatchArguments(["dev"])).toEqual([
    "watch",
    "--typecheck",
    "--configLoader",
    "native",
  ]);

  expect(() => resolveVitestArguments(["watch"])).toThrow(/watch mode/u);
});
