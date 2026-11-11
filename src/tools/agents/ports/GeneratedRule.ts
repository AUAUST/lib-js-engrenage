import type { Globs } from "#types/Globs";

export interface GeneratedRule {
  readonly name: string;
  readonly paths?: Globs;
  readonly directives: readonly string[];
}
