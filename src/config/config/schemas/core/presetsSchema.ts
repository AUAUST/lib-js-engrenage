import {
  array,
  description,
  picklist,
  pipe,
  union,
  type GenericSchema,
} from "valibot";

import { join } from "@auaust/primitive-kit/arrays";

import { presets } from "#config/constants";
import type { Preset } from "#config/types/Preset";
import type { Presets } from "#config/types/Presets";

const presetSchema = picklist(presets);

export const presetsSchema: GenericSchema<Preset | Presets> = pipe(
  union([presetSchema, array(presetSchema)]),
  description(
    join(
      [
        "Kinds of project the configuration builds on.",
        "`library` extends the library tsconfig, syncs the published `package.json` fields (`files`, `bin`, `engines.node`) and selects the library GitHub workflows.",
        "@default none",
      ],
      "\n",
    ),
  ),
);
