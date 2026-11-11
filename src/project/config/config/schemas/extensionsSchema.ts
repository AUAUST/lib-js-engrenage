import { array } from "valibot";

import { declare } from "#foundation/options/index";
import { extensionOptionSchema } from "#project/config/config/schemas/extensionOptionSchema";

export const extensionsSchema = declare(array(extensionOptionSchema), {
  description: [
    "Extensions to register beside the built-ins, in this order.",
    "Nested lists are flattened in place, so a package may export several extensions as one list.",
    "An installed package does nothing until listed here.",
  ],
  optional: { value: [] },
});
