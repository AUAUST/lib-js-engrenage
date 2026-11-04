import type { createStepContext } from "#cli/utils/createStepContext";

export interface StepContext extends ReturnType<typeof createStepContext> {}
