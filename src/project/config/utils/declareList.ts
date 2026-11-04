import type { GenericSchema } from "valibot";

import { listOptionSchema } from "#config/config/schemas/values/listOptionSchema";
import { resolveListOption } from "#config/utils/resolveListOption";
import { declare } from "#options/utils/declare";
import type { ListOption } from "#config/types/ListOption";
import type { Declaration } from "#options/types/Declaration";
import type { Default } from "#options/types/Default";
import type { Description } from "#options/types/Description";

export function declareList<Item extends string, Context = unknown>(
  item: GenericSchema<Item>,
  options: {
    description?: Description;
    optional: Default<readonly Item[], Context>;
  },
): Declaration<ListOption<Item> | undefined, readonly Item[], Context> {
  return declare(listOptionSchema(item), {
    ...options,
    adjust(input, fallback, _context, path) {
      return resolveListOption(input, fallback, path);
    },
  });
}
