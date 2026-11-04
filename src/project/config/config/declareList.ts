import type { GenericSchema } from "valibot";

import { declare } from "#foundation/options/utils/declare";
import { listOptionSchema } from "#project/config/config/schemas/values/listOptionSchema";
import { resolveListOption } from "#project/config/operations/resolveListOption";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { Default } from "#foundation/options/types/Default";
import type { Description } from "#foundation/options/types/Description";
import type { ListOption } from "#project/config/types/ListOption";

// @debt a `config/` module imports `operations/`: resolveListOption warns on the console, so it cannot be a pure `utils/` function the declaration could import
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
