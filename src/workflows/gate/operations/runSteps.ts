import { iterable } from "@auaust/toolkit";
import { filter } from "@auaust/toolkit/array";

import type { GateResult } from "#project/gate/index";
import type { Files } from "#types/Files";
import type { GateStep } from "#workflows/gate/apis/GateStep";
import type { GateChanges } from "#workflows/gate/types/GateChanges";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateWarning } from "#workflows/gate/types/GateWarning";
import type { StepsOutcome } from "#workflows/gate/types/StepsOutcome";

interface StepOutcome {
  readonly failure: GateFailure | undefined;
  readonly warning: GateWarning | undefined;
}

async function runStep(
  step: GateStep,
  files: Files,
  removed: Files,
): Promise<StepOutcome> {
  let result: GateResult;

  try {
    result = await step.run(files, removed);
  } catch (error) {
    result = {
      ok: false,
      output: error instanceof Error ? error.message : String(error),
    };
  }

  const name = result.name ?? step.name;

  return {
    failure: result.ok ? undefined : { step: name, output: result.output },
    warning: result.warnings === undefined || result.warnings === ""
      ? undefined
      : { step: name, output: result.warnings },
  };
}

function collectOutcomes(outcomes: readonly StepOutcome[]): StepsOutcome {
  return {
    failures: filter(
      outcomes.map(({ failure }) => failure),
      (failure) => failure !== undefined,
    ),
    warnings: filter(
      outcomes.map(({ warning }) => warning),
      (warning) => warning !== undefined,
    ),
  };
}

async function runSequentially(
  steps: readonly GateStep[],
  files: Files,
  removed: Files,
): Promise<StepsOutcome> {
  const outcomes: StepOutcome[] = [];

  for (const step of steps) {
    outcomes.push(await runStep(step, files, removed));
  }

  return collectOutcomes(outcomes);
}

async function runConcurrently(
  steps: readonly GateStep[],
  files: Files,
  removed: Files,
): Promise<StepsOutcome> {
  const outcomes = await Promise.all(
    iterable.map(steps, (step) => {
      return runStep(step, files, removed);
    }),
  );

  return collectOutcomes(outcomes);
}

export function runSteps(
  steps: readonly GateStep[],
  { files, removed }: GateChanges,
  { concurrent }: { concurrent: boolean },
): Promise<StepsOutcome> {
  return concurrent
    ? runConcurrently(steps, files, removed)
    : runSequentially(steps, files, removed);
}
