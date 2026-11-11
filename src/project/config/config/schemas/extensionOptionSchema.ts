import { array, lazy, union, type GenericSchema } from "valibot";

import { extensionSchema } from "#project/config/config/schemas/extensionSchema";
import type { ExtensionOption } from "#project/config/types/ExtensionOption";

export const extensionOptionSchema: GenericSchema<
  unknown,
  ExtensionOption
> = union([
  extensionSchema,
  array(
    lazy(() => {
      return extensionOptionSchema;
    }),
  ),
]);
