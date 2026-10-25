import type { MaybeAsyncFn } from "@auaust/toolkit/types";

export type ConfigInput<Data> = MaybeAsyncFn<Data, []>;
