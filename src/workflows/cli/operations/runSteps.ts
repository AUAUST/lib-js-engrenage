import { map } from "@auaust/primitive-kit/arrays";

import { createStepContext } from "#workflows/cli/operations/createStepContext";
import type { Invocation } from "#project/steps/types/Invocation";
import type { Prompter } from "#project/steps/types/Prompter";
import type { Step } from "#project/steps/types/Step";
import type { Config } from "#workflows/registry/types/Config";

export async function runSteps({
  config,
  prompter,
  steps,
}: {
  config: Config;
  prompter: Prompter;
  steps: readonly Step<Config>[];
}): Promise<readonly Invocation[] | undefined> {
  const context = createStepContext({
    config,
    prompter,
  });

  const gaps = steps.filter((step) => step.isMissing(context));

  if (gaps.length === 0) {
    return void console.info("Engrenage is set up, nothing is missing.");
  }

  if (config.configFile !== undefined) {
    const names = map(gaps, (step) => step.name).join(", ");

    const fill = await prompter.confirm(
      `Engrenage is already set up. Review the missing setup (${names})?`,
    );

    if (!fill) {
      return;
    }
  }

  async function accepts({
    message,
    isRecommended,
  }: Step<Config>): Promise<boolean> {
    return (
      message === undefined ||
      prompter.confirm(message, isRecommended?.(context) ?? true)
    );
  }

  for (const step of steps) {
    if (step.isMissing(context) && (await accepts(step))) {
      await step.plan(context);
    }
  }

  return context.getInvocations();
}
