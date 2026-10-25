import { string, type GenericSchema } from "valibot";

import type { File } from "#types/File";

export const fileSchema: GenericSchema<File> = string();
