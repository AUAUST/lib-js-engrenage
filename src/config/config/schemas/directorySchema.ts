import type { Directory } from "#types/Directory";
import { string, type GenericSchema } from "valibot";

export const directorySchema: GenericSchema<Directory> = string();
