import type { StepContext } from "#project/steps/types/StepContext";

export interface Step {
  name: string;
  message?: string;
  isMissing(context: StepContext): boolean | Promise<boolean>;
  isRecommended?(context: StepContext): boolean | Promise<boolean>;
  plan(context: StepContext): void | Promise<void>;
}
