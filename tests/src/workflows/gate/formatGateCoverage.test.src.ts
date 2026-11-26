import { expect, test } from "vitest";

import { formatGateCoverage } from "#workflows/gate/index";

test("names the steps that passed and the files they checked", () => {
  expect(
    formatGateCoverage({
      steps: ["prettier", "typecheck"],
      scope: 2,
      reused: false,
    }),
  ).toBe("Gate passed: prettier, typecheck on 2 changed files.");
});

test("states that a run without changes checked nothing", () => {
  expect(
    formatGateCoverage({
      steps: [],
      scope: 0,
      reused: false,
    }),
  ).toBe("Gate checked nothing: no change to check.");
});
