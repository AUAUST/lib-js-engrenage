// @debt reaches into project/config, a higher layer than foundation; the layered registry (#143) removes the upward dependency
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { FileSync } from "#types/FileSync";

export function syncFiles(
  { filesystem, resolve }: ResolvedConfig,
  files: readonly FileSync[],
) {
  for (const { file, update } of files) {
    const current = filesystem.read(file);

    if (current !== undefined) {
      filesystem.write(file, update(current, resolve(file)));
    }
  }
}
