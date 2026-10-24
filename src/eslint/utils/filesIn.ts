import { typescriptFiles } from "#eslint/presets/typescriptFiles";
import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

export function filesIn(directory: Directory): Glob {
  return `${directory}/${typescriptFiles}`;
}
