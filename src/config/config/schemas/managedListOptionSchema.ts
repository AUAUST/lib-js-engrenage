import { boolean, union, type GenericSchema } from "valibot";

import { listOptionSchema } from "#config/config/schemas/listOptionSchema";
import type { ManagedListOption } from "#config/types/ManagedListOption";

export function managedListOptionSchema<Item>(
  item: GenericSchema<Item>,
): GenericSchema<ManagedListOption<Item>> {
  return union([listOptionSchema(item), boolean()]);
}
