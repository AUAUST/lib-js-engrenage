import {
  array,
  exactOptional,
  strictObject,
  union,
  type GenericSchema,
} from "valibot";

import type { ListOption } from "#config/types/ListOption";

export function listOptionSchema<Item>(
  item: GenericSchema<Item>,
): GenericSchema<ListOption<Item>> {
  const items = union([item, array(item)]);

  return union([
    items,
    strictObject({
      prepend: exactOptional(items),
      append: exactOptional(items),
      exclude: exactOptional(items),
    }),
  ]);
}
