import { codeFilesSchema } from "#config/config/schemas/codeFilesSchema";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";
import { getDefault } from "valibot";

export function filesIn(directory: Directory): Glob {
  return `${directory}/${getDefault(codeFilesSchema)}`;
}
