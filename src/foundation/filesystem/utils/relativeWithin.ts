import { relative } from "node:path";

import { resolveWithin } from "#filesystem/utils/resolveWithin";
import { toPosixPath } from "#filesystem/utils/toPosixPath";
import type { Directory } from "#types/Directory";

export function relativeWithin(base: Directory, path: string): string {
  return toPosixPath(relative(base, resolveWithin(base, path)));
}
