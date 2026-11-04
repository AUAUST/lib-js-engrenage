import type { MaybeArray } from "@auaust/toolkit/types";

import type { ListAdjustment } from "#config/types/ListAdjustment";

export type ListOption<Item> = MaybeArray<Item> | ListAdjustment<Item>;
