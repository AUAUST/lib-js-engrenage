import type { MaybeAsyncFn } from "@auaust/toolkit/types";

export type ConfigInput<Data, Arguments extends unknown[] = []> = MaybeAsyncFn<
  Data,
  Arguments
>;
