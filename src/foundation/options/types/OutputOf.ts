import type { Declaration } from "#options/types/Declaration";

export type OutputOf<Source> =
  Source extends Declaration<unknown, infer Output, never> ? Output : never;
