import type { Declaration } from "#foundation/options/ports/Declaration";

export type InputOf<Source> = Source extends Declaration<
  infer Input,
  unknown,
  never
>
  ? Input
  : never;
