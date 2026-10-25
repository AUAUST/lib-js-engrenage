import type { File } from "#types/File";
import { string, type GenericSchema } from "valibot";

export const fileSchema: GenericSchema<File> = string();
