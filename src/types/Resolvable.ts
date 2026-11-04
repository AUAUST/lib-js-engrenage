import type { Maybe, MaybeAsyncFn } from "@auaust/toolkit/types";

export type Resolvable<Data, Arguments extends unknown[] = []> = Maybe<
  MaybeAsyncFn<Data, Arguments>
>;
