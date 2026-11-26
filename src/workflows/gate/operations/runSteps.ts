import { iterable } from "@auaust/toolkit";
import { filter, map } from "@auaust/toolkit/array";
import { sum } from "@auaust/toolkit/math";
import { measureAsync } from "@auaust/toolkit/time";

import type { GateResult } from "#project/gate/index";
import type { Files } from "#types/Files";
import type { GateStep } from "#workflows/gate/apis/GateStep";
import type { GateChanges } from "#workflows/gate/types/GateChanges";
import type { GateFailure } from "#workflows/gate/types/GateFailure";
import type { GateStepTiming } from "#workflows/gate/types/GateStepTiming";
import type { GateWarning } from "#workflows/gate/types/GateWarning";
import type { StepsOutcome } from "#workflows/gate/types/StepsOutcome";

interface StepOutcome {
  readonly failure: GateFailure | undefined;
  readonly warning: GateWarning | undefined;
  readonly timing: GateStepTiming;
}

async function settleStep(
  step: GateStep,
  files: Files,
  removed: Files,
): Promise<GateResult> {
  try {
    return await step.run(files, removed);
  } catch (error) {
    return {
      ok: false,
      output: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runStep(
  step: GateStep,
  files: Files,
  removed: Files,
): Promise<StepOutcome> {
  const {
    result,
    duration,
  } = await measureAsync(settleStep, step, files, removed);

  const name = result.name ?? step.name;

  return {
    failure: result.ok ? undefined : { step: name, output: result.output },
    warning: result.warnings === undefined || result.warnings === ""
      ? undefined
      : { step: name, output: result.warnings },
    timing: { name: step.name, duration },
  };
}

function collectOutcomes(
  group: string,
  outcomes: readonly StepOutcome[],
  duration: number,
): StepsOutcome {
  return {
    failures: filter(
      map(outcomes, ({ failure }) => failure),
      (failure) => failure !== undefined,
    ),
    warnings: filter(
      map(outcomes, ({ warning }) => warning),
      (warning) => warning !== undefined,
    ),
    timing: {
      name: group,
      duration,
      steps: map(outcomes, ({ timing }) => timing),
    },
  };
}

async function runSequentially(
  group: string,
  steps: readonly GateStep[],
  files: Files,
  removed: Files,
): Promise<StepsOutcome> {
  const outcomes: StepOutcome[] = [];

  for (const step of steps) {
    outcomes.push(await runStep(step, files, removed));
  }

  return collectOutcomes(
    group,
    outcomes,
    sum(...map(outcomes, ({ timing }) => timing.duration)),
  );
}

async function runConcurrently(
  group: string,
  steps: readonly GateStep[],
  files: Files,
  removed: Files,
): Promise<StepsOutcome> {
  const { result: outcomes, duration } = await measureAsync(() => {
    return Promise.all(
      iterable.map(steps, (step) => {
        return runStep(step, files, removed);
      }),
    );
  });

  return collectOutcomes(group, outcomes, duration);
}

/**
 * Runs `steps` as the `group` its outcome's timing names, one after another
 * unless `concurrent`.
 */
export function runSteps(
  steps: readonly GateStep[],
  { files, removed }: GateChanges,
  { group, concurrent }: { group: string; concurrent: boolean },
): Promise<StepsOutcome> {
  return concurrent
    ? runConcurrently(group, steps, files, removed)
    : runSequentially(group, steps, files, removed);
}
