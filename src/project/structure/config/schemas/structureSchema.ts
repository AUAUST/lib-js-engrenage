import { boolean } from "valibot";

import { declare, declareObject } from "#foundation/options/index";
import { effectsSchema } from "#project/structure/config/schemas/effectsSchema";

export const structureSchema = declareObject(
  {
    effects: effectsSchema,
    internals: declare(boolean(), {
      description:
        "Whether every domain exposes its index under `<subpath>/internals`, with no stability guarantee.",
      optional: { value: false },
    }),
  },
  {
    description: "Structure settings shared by every environment.",
    optional: true,
  },
);
