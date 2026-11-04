import type { MaybeArray } from "@auaust/toolkit/types";

export interface ListAdjustment<Item> {
  prepend?: MaybeArray<Item>;
  append?: MaybeArray<Item>;
  exclude?: MaybeArray<Item>;
}
