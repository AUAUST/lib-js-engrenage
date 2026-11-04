import type { Rules } from "#eslint/types/Rules";

export type RuleOptions<Id extends keyof Rules> =
  Extract<NonNullable<Rules[Id]>, readonly unknown[]> extends readonly [
    unknown,
    ...infer Options,
  ]
    ? Options
    : never;
