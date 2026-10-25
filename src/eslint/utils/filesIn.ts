import type { Directory } from "#types/Directory";
import type { Glob } from "#types/Glob";

export function filesIn(directory: Directory, codeFiles: Glob): Glob {
  return `${directory}/${codeFiles}`;
}
