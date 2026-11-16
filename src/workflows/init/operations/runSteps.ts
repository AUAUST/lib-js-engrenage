import { iterable } from "@auaust/toolkit";

import { createStepContext } from "#workflows/init/operations/createStepContext";
import type { LoadedConfig } from "#project/config/index";
import type { Invocation, Prompter, Step } from "#project/steps/index";

export async function runSteps({
  config,
  prompter,
  steps,
}: {
  config: LoadedConfig;
  prompter: Prompter;
  steps: readonly Step[];
}): Promise<readonly Invocation[] | undefined> {
  const context = await createStepContext({
    config,
    prompter,
  });

  const gaps: Step[] = [];

  for (const step of steps) {
    if (await step.isMissing(context)) {
      gaps.push(step);
    }
  }

  if (gaps.length === 0) {
    return void console.info("Engrenage is set up, nothing is missing.");
  }

  if (config.context.configFile !== undefined) {
    const names = iterable.join(
      iterable.map(gaps, (step) => step.name),
      ", ",
    );

    const fill = await prompter.confirm(
      `Engrenage is already set up. Review the missing setup (${names})?`,
    );

    if (!fill) {
      return;
    }
  }

  async function accepts({ message, isRecommended }: Step): Promise<boolean> {
    return (
      message === undefined ||
      prompter.confirm(message, (await isRecommended?.(context)) ?? true)
    );
  }

  for (const step of steps) {
    if ((await step.isMissing(context)) && (await accepts(step))) {
      await step.plan(context);
    }
  }

  return context.getInvocations();
}
