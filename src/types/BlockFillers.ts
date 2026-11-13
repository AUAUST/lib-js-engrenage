import type { MaybePromise } from "@auaust/toolkit/types";

/**
 * Fills generated blocks by directive: each `@<directive>` marker calls the
 * filler of that name with the marker's arguments. The returned content replaces
 * the block's; `undefined` leaves the block as it is.
 */
export type BlockFillers = Record<
  string,
  (...args: string[]) => MaybePromise<string | undefined>
>;
