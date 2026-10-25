import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import type { Directory } from "#types/Directory";
import { relative, sep } from "node:path";

export function relativeWithin(base: Directory, path: string): string {
  return relative(base, resolveWithin(base, path)).split(sep).join("/");
}
