import type { Maybe, MaybeAsyncFn } from "@auaust/toolkit/types";

export type ConfigInput<Data, Arguments extends unknown[] = []> = Maybe<
  MaybeAsyncFn<Data, Arguments>
>;
