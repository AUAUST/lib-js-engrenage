import { boolean } from "valibot";

import { declare } from "#foundation/options/utils/declare";

export const debugSchema = declare(boolean(), {
  description: [
    "Whether commands print the stack of an error and its causes.",
    "Also enabled by the `--debug` flag and `ENGRENAGE_DEBUG=1`; any one of them enables it.",
  ],
  optional: { value: false },
});
