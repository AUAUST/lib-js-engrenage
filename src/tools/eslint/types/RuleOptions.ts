import type { Rules } from "#tools/eslint/types/Rules";

/**
 * The options of rule `Id`, without its severity; `never` for a rule without
 * typed options.
 */
export type RuleOptions<Id extends keyof Rules> = Extract<
  NonNullable<Rules[Id]>,
  readonly unknown[]
> extends readonly [unknown, ...infer Options]
  ? Options
  : never;
