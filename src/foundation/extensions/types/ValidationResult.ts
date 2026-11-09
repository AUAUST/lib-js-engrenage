import type { ValidationIssue } from "#foundation/extensions/types/ValidationIssue";

export interface ValidationResult {
  readonly value?: unknown;
  readonly issues?: readonly ValidationIssue[] | undefined;
}
