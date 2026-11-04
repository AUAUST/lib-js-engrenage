import type { MaybeArray } from "@auaust/toolkit/types";

import type { ListAdjustment } from "#foundation/options/types/ListAdjustment";

export type ListOption<Item> = MaybeArray<Item> | ListAdjustment<Item>;
