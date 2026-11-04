import type { createStepContext } from "#workflows/cli/operations/createStepContext";

export interface StepContext extends ReturnType<typeof createStepContext> {}
