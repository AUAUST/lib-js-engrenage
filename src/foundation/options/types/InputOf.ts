import type { Declaration } from "#foundation/options/types/Declaration";

export type InputOf<Source> = Source extends Declaration<
  infer Input,
  unknown,
  never
>
  ? Input
  : never;
