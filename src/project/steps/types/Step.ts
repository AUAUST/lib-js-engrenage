import type { StepContext } from "#project/steps/types/StepContext";

export interface Step<Sections = object> {
  name: string;
  message?: string;
  isMissing(context: StepContext<Sections>): boolean;
  isRecommended?(context: StepContext<Sections>): boolean;
  plan(context: StepContext<Sections>): void | Promise<void>;
}
