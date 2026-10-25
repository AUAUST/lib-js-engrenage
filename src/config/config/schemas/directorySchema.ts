import { string, type GenericSchema } from "valibot";

import type { Directory } from "#types/Directory";

export const directorySchema: GenericSchema<Directory> = string();
