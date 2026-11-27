export interface WarningReporter {
  /**
   * Reports a problem in an option's input that does not fail its resolution.
   */
  warn(text: string): void;
}
