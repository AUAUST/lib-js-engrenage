import { boolean, description, pipe } from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

export const debugSchema = pipe(
  boolean(),
  description(
    join(
      [
        "Whether commands print the stack of an error and its causes.",
        "Also enabled by the `--debug` flag and `ENGRENAGE_DEBUG=1`; any one of them enables it.",
        "@default `false`",
      ],
      "\n",
    ),
  ),
);
