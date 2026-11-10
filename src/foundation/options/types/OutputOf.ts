import type { Declaration } from "#foundation/options/types/Declaration";

export type OutputOf<Source> = Source extends Declaration<
  unknown,
  infer Output,
  never
>
  ? Output
  : never;
