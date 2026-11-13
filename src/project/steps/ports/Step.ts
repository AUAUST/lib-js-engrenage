import type { StepContext } from "#project/steps/ports/StepContext";

/**
 * @experimental
 */
export interface Step {
  /**
   * Names the step in the list of missing setup offered for review in a project
   * that already has a config file.
   */
  name: string;
  /**
   * The yes-or-no question asked before planning the step; without one, a missing
   * step is planned without asking.
   */
  message?: string;
  /**
   * Tells whether the setup the step provides is absent. Called for every step
   * before any is planned, then again right before planning this one, so it must
   * read the writes earlier steps staged.
   */
  isMissing(context: StepContext): boolean | Promise<boolean>;
  /**
   * The default answer to `message`; without it, the default is yes.
   */
  isRecommended?(context: StepContext): boolean | Promise<boolean>;
  /**
   * Stages the step's writes and invocations on `context`; called only when the
   * step is missing and its question, if any, was accepted.
   */
  plan(context: StepContext): void | Promise<void>;
}
