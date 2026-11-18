import { matchesGlob } from "node:path";

import { listLocationGlobs, type LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

export async function listScannedFiles(config: LoadedConfig): Promise<Files> {
  const [
    files,
    resources,
  ] = await Promise.all([config.resolve("files"), config.resolve("resources")]);

  const barrels = resources.get("typescript.barrels")?.location;

  const excluded = [
    ...files.generated,
    ...files.fixtures,
    ...(barrels == null ? [] : listLocationGlobs(barrels)),
  ];

  const candidates = await config.context.filesystem.glob([
    ...files.published,
    ...files.private,
  ]);

  return candidates.filter((file) => {
    return !excluded.some((glob) => matchesGlob(file, glob));
  });
}
