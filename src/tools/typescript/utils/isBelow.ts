import type { Directory } from "#types/Directory";

export function isBelow(directory: Directory, path: string): boolean {
  return directory === "." || path.startsWith(`${directory}/`);
}
