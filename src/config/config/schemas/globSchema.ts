import { string, type GenericSchema } from "valibot";

import type { Glob } from "#types/Glob";

export const globSchema: GenericSchema<Glob> = string();
