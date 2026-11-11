import type { MaybePromise } from "@auaust/toolkit/types";

export type BlockFillers = Record<
  string,
  (...args: string[]) => MaybePromise<string | undefined>
>;
