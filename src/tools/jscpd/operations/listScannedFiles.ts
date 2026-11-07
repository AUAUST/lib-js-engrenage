import { matchesGlob } from "node:path";

import { filesSection } from "#project/structure/index";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

export async function listScannedFiles(config: LoadedConfig): Promise<Files> {
  const files = await config.resolve(filesSection);

  const excluded = [...files.generated, ...files.fixtures];

  const candidates = await config.context.filesystem.glob([
    ...files.published,
    ...files.private,
  ]);

  return candidates.filter((file) => {
    return !excluded.some((glob) => matchesGlob(file, glob));
  });
}
