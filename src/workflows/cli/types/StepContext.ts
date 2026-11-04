import type { createStepContext } from "#cli/operations/createStepContext";

export interface StepContext extends ReturnType<typeof createStepContext> {}
