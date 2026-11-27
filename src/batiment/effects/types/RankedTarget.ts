/**
 * A ranked unit or member: the level of evaluating it and of invoking it.
 */
export interface RankedTarget {
  readonly evaluation: string | undefined;
  readonly invocation: string | undefined;
}
