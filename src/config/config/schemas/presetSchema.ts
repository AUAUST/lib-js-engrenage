import { picklist } from "valibot";

import { presets } from "#config/constants";

export const presetSchema = picklist(presets);
