import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { runSteps, type GateStep } from "#workflows/gate/index";

const changes = { files: [], removed: [] };

function defineStep(name: string, delay: number): GateStep {
  return {
    audience: "everyone",
    name,
    async run() {
      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });

      return { ok: true, output: "" };
    },
  };
}

const steps = [defineStep("first", 30), defineStep("second", 50)];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["performance", "setTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
});

test("times a sequential group as the sum of its steps", async () => {
  const outcome = runSteps(steps, changes, {
    group: "fixes",
    concurrent: false,
  });

  await vi.runAllTimersAsync();

  expect((await outcome).timing).toEqual({
    name: "fixes",
    duration: 80,
    steps: [
      { name: "first", duration: 30 },
      { name: "second", duration: 50 },
    ],
  });
});

test("times a concurrent group by its wall time", async () => {
  const outcome = runSteps(steps, changes, {
    group: "checks",
    concurrent: true,
  });

  await vi.runAllTimersAsync();

  expect((await outcome).timing).toEqual({
    name: "checks",
    duration: 50,
    steps: [
      { name: "first", duration: 30 },
      { name: "second", duration: 50 },
    ],
  });
});
