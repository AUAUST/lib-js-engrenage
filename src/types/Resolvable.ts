import type { Maybe, MaybeAsyncFn } from "@auaust/toolkit/types";

/**
 * A value, or a function of `Arguments` returning it or a promise of it; `null`
 * and `undefined` stand for no value.
 */
export type Resolvable<Data, Arguments extends unknown[] = []> = Maybe<
  MaybeAsyncFn<Data, Arguments>
>;
