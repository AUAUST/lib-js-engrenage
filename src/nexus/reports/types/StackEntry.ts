/**
 * The stack trace of an error.
 */
export interface StackEntry {
  readonly kind: "stack";
  readonly trace: string;
}
