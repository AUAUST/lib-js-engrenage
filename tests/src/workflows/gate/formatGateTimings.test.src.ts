import { expect, test } from "vitest";

import { formatGateTimings } from "#workflows/gate/index";

const timings = {
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
    {
      name: "tree",
      duration: 80,
      steps: [{ name: "identity", duration: 80 }],
    },
  ],
  duration: 3100,
};

test("sums up the run on one line with the stage groups that ran", () => {
  expect(formatGateTimings(timings)).toBe(
    "Duration 3.10s (fixes 450ms, checks 2.35s)",
  );
});

test("prints the total alone for a run reusing an earlier one", () => {
  expect(
    formatGateTimings(
      {
        groups: [
          {
            name: "stamp",
            duration: 90,
            steps: [{ name: "lookup", duration: 90 }],
          },
        ],
        duration: 120,
      },
      {
        reused: true,
      },
    ),
  ).toBe("Duration 120ms");
});

test("lists each group with its steps below it, then the total, when detailed", () => {
  expect(
    formatGateTimings(
      {
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
      },
      {
        detailed: true,
      },
    ),
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

test("prints no detail for a run whose groups ran no step", () => {
  expect(
    formatGateTimings(
      {
        groups: [
          {
            name: "local",
            duration: 0,
            steps: [],
          },
        ],
        duration: 12,
      },
      {
        detailed: true,
      },
    ),
  ).toBeUndefined();
});
