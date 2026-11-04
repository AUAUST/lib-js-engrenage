import { array, picklist, union, type GenericSchema } from "valibot";

import { presets } from "#presets/constants";
import type { Preset } from "#presets/types/Preset";
import type { Presets } from "#presets/types/Presets";

const presetSchema = picklist(presets);

export const presetListSchema: GenericSchema<Preset | Presets> = union([
  presetSchema,
  array(presetSchema),
]);
