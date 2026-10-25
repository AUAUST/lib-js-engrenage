import type { Glob } from "#types/Glob";
import { string, type GenericSchema } from "valibot";

export const globSchema: GenericSchema<Glob> = string();
