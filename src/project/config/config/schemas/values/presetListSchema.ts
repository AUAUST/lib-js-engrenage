import { array, picklist, union, type GenericSchema } from "valibot";

import { presets } from "#project/presets/constants";
import type { Preset } from "#project/presets/types/Preset";
import type { Presets } from "#project/presets/types/Presets";

const presetSchema = picklist(presets);

export const presetListSchema: GenericSchema<Preset | Presets> = union([
  presetSchema,
  array(presetSchema),
]);
