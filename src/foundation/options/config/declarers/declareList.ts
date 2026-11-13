import type { GenericSchema } from "valibot";

import { declare } from "#foundation/options/config/declarers/declare";
import { listOptionSchema } from "#foundation/options/config/schemas/listOptionSchema";
import { resolveListOption } from "#foundation/options/utils/resolveListOption";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { Default } from "#foundation/options/types/Default";
import type { Description } from "#foundation/options/types/Description";
import type { ListOption } from "#foundation/options/types/ListOption";

// @debt resolveListOption warns on the console, which a pure `utils/` function should not do
/**
 * @stable
 */
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
