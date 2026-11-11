import { posix } from "node:path";

import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

export async function listStructureFiles(
  filesystem: Filesystem,
  directory: Directory,
): Promise<string[]> {
  const files = await filesystem.list(directory, { recursive: false });

  return files.map((file) => posix.basename(file));
}
