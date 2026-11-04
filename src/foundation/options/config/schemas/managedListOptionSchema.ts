import { boolean, union, type GenericSchema } from "valibot";

import { listOptionSchema } from "#foundation/options/config/schemas/listOptionSchema";
import type { ManagedListOption } from "#foundation/options/types/ManagedListOption";

export function managedListOptionSchema<Item>(
  item: GenericSchema<Item>,
): GenericSchema<ManagedListOption<Item>> {
  return union([listOptionSchema(item), boolean()]);
}
