import type { GenericSchema } from "valibot";

import { declare } from "#foundation/options/config/declarers/declare";
import { listOptionSchema } from "#foundation/options/config/schemas/listOptionSchema";
import { resolveListOption } from "#foundation/options/utils/resolveListOption";
import type { Declaration } from "#foundation/options/ports/Declaration";
import type { Default } from "#foundation/options/ports/Default";
import type { Description } from "#foundation/options/types/Description";
import type { ListOption } from "#foundation/options/types/ListOption";

// @debt resolveListOption warns on the console, which a pure `utils/` function should not do
/**
 * Declares a list option: a missing input resolves to the `optional` default, an
 * item or array replaces it, and `prepend`, `append` and `exclude` adjust it.
 * Warns on the console about duplicated items and excluded items absent from the
 * default.
 *
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
