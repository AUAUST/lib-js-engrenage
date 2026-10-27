import { map } from "@auaust/primitive-kit/arrays";

import { createPrompter } from "#support/scaffold/utils/createPrompter";
import { createStepContext } from "#support/scaffold/utils/createStepContext";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Invocation } from "#support/scaffold/types/Invocation";
import type { Step } from "#support/scaffold/types/Step";

export async function runSteps({
  config,
  steps,
  yes,
}: {
  config: ResolvedConfig;
  steps: ReadonlyArray<Step>;
  yes: boolean;
}): Promise<ReadonlyArray<Invocation> | undefined> {
  const prompter = createPrompter({
    yes,
  });

  const context = createStepContext({
    config,
    prompter,
  });

  const gaps = steps.filter((step) => step.isMissing(context));

  if (gaps.length === 0) {
    console.info("Engrenage is set up, nothing is missing.");

    return undefined;
  }

  if (config.configFile !== undefined) {
    const names = map(gaps, (step) => step.name).join(", ");

    const fill = await prompter.confirm(
      `Engrenage is already set up. Fill in the gaps (${names})?`,
    );

    if (!fill) {
      return undefined;
    }
  }

  for (const step of steps) {
    if (step.isMissing(context) && (await prompter.confirm(step.message))) {
      await step.plan(context);
    }
  }

  return context.getInvocations();
}
