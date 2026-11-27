import { expect, test } from "vitest";

import { readReportText } from "#nexus/reports/index";
import { formatGateSummary } from "#workflows/gate/index";

test("names the failing steps in order", () => {
  expect(
    readReportText(
      formatGateSummary([
        { step: "structure", output: "" },
        { step: "typecheck", output: "" },
      ]),
    ),
  ).toBe("Failing steps: structure, typecheck");
});
