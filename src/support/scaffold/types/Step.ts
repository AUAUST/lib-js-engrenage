import type { StepContext } from "#support/scaffold/types/StepContext";

export interface Step {
  name: string;
  message?: string;
  isMissing: (context: StepContext) => boolean;
  isRecommended?: (context: StepContext) => boolean;
  plan: (context: StepContext) => void | Promise<void>;
}
