import { expect, test } from "vitest";

import { formatGateSummary } from "#workflows/gate/index";

test("names the failing steps in order", () => {
  expect(
    formatGateSummary([
      { step: "structure", output: "" },
      { step: "typecheck", output: "" },
    ]),
  ).toBe("Failing steps: structure, typecheck");
});
