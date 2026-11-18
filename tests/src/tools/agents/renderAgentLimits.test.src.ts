import { expect, test } from "vitest";

import { renderAgentLimits } from "#tools/agents/utils/renderAgentLimits";

test("renders one row per agent skill with its limits", () => {
  expect(
    renderAgentLimits([
      {
        agent: {
          name: "worker",
          description: "Implements issues.",
          effort: "low",
          efforts: { involved: "medium", complex: "medium" },
        },
      },
      {
        agent: undefined,
      },
      {
        agent: {
          name: "planner",
          description: "Plans work.",
          effort: "medium",
          freshness: 2,
        },
      },
    ]),
  ).toBe(
    [
      "| Agent | Default effort | Effort by complexity | Fresh up to |",
      "| --- | --- | --- | --- |",
      "| `worker` | low | `involved`: medium, `complex`: medium | no limit |",
      "| `planner` | medium | none | 2× its starting context |",
    ].join("\n"),
  );
});

test("reports that no agent skill is installed", () => {
  expect(renderAgentLimits([{ agent: undefined }])).toBe(
    "No agent skills are installed.",
  );
});
