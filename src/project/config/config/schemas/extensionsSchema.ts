import { array } from "valibot";

import { declare } from "#foundation/options/index";
import { extensionSchema } from "#project/config/config/schemas/extensionSchema";

export const extensionsSchema = declare(array(extensionSchema), {
  description: [
    "Extensions to register beside the built-ins, in this order.",
    "An installed package does nothing until listed here.",
  ],
  optional: { value: [] },
});
