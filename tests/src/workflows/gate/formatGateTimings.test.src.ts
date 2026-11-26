import { expect, test } from "vitest";

import { formatGateTimings } from "#workflows/gate/index";

test("lists each group with its steps below it, then the total", () => {
  expect(
    formatGateTimings({
      groups: [
        {
          name: "fixes",
          duration: 450.4,
          steps: [{ name: "prettier", duration: 450.4 }],
        },
        {
          name: "warnings",
          duration: 0,
          steps: [],
        },
        {
          name: "checks",
          duration: 2345,
          steps: [
            { name: "typecheck", duration: 2345 },
            { name: "sync --check", duration: 999.6 },
          ],
        },
      ],
      duration: 3100,
    }),
  ).toBe(
    [
      "Durations",
      "  fixes           450ms",
      "    prettier      450ms",
      "  checks          2.35s",
      "    typecheck     2.35s",
      "    sync --check  1.00s",
      "  total           3.10s",
    ].join("\n"),
  );
});

test("prints nothing for a run whose groups ran no step", () => {
  expect(
    formatGateTimings({
      groups: [
        {
          name: "local",
          duration: 0,
          steps: [],
        },
      ],
      duration: 12,
    }),
  ).toBeUndefined();
});
