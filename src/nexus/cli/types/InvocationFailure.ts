export interface InvocationFailure {
  /**
   * The invocation's 1-based position in its chain.
   */
  readonly position: number;
  readonly error: unknown;
}
