import type { File } from "#types/File";

export function joinLocated(directory: File, name: string): File {
  return directory === "" ? name : `${directory}/${name}`;
}
