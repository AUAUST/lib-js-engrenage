import type { ValidationResult } from "#foundation/extensions/types/ValidationResult";

export interface EntryValidator {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    validate(value: unknown): ValidationResult | Promise<ValidationResult>;
  };
}
