import { expect, test } from "vitest";

import { renderAgentLimits } from "#metalbrain/runtimes/utils/renderAgentLimits";

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
          name: "consultant",
          description: "Settles a walk's stops.",
          effort: "medium",
          ceiling: 100_000,
        },
      },
    ]),
  ).toBe(
    [
      "| Agent | Default effort | Effort by complexity | Fresh up to |",
      "| --- | --- | --- | --- |",
      "| `worker` | low | `involved`: medium, `complex`: medium | no limit |",
      "| `consultant` | medium | none | 100k context |",
    ].join("\n"),
  );
});

test("reports that no agent skill is installed", () => {
  expect(renderAgentLimits([{ agent: undefined }])).toBe(
    "No agent skills are installed.",
  );
});
