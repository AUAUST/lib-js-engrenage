import { boolean, union, type GenericSchema } from "valibot";

import { listOptionSchema } from "#project/config/config/schemas/values/listOptionSchema";
import type { ManagedListOption } from "#project/config/types/ManagedListOption";

export function managedListOptionSchema<Item>(
  item: GenericSchema<Item>,
): GenericSchema<ManagedListOption<Item>> {
  return union([listOptionSchema(item), boolean()]);
}
