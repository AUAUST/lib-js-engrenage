import type { GenericSchema } from "valibot";

import { managedListOptionSchema } from "#foundation/options/config/schemas/managedListOptionSchema";
import { declare } from "#foundation/options/utils/declare";
import { unset } from "#foundation/options/utils/unset";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { Description } from "#foundation/options/types/Description";
import type { ManagedListOption } from "#foundation/options/types/ManagedListOption";

export function declareManagedList<Item extends string>(
  item: GenericSchema<Item>,
  options: {
    description: Description;
    explain: string;
  },
): Declaration<
  ManagedListOption<Item> | undefined,
  ManagedListOption<Item> | undefined,
  unknown
> {
  // @debt the default is computed per tsconfig target by the produce functions of typescript/setup, and the declaration only documents it
  return declare(managedListOptionSchema(item), {
    description: options.description,
    optional: unset(options.explain),
  });
}
