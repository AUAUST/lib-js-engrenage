import { array, picklist, union, type GenericSchema } from "valibot";

import { presets } from "#config/constants";
import type { Preset } from "#config/types/Preset";
import type { Presets } from "#config/types/Presets";

const presetSchema = picklist(presets);

export const presetsSchema: GenericSchema<Preset | Presets> = union([
  presetSchema,
  array(presetSchema),
]);
