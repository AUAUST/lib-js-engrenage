import { flatMap } from "@auaust/primitive-kit/arrays";
import { values } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

export async function listBarrelCandidates(
  config: LoadedConfig,
): Promise<File[]> {
  const structure = await config.resolve("structure");

  const globs = flatMap(values(structure), (environment) => {
    if (environment === undefined) {
      return [];
    }

    const { dirs, indexFile, entryFile } = environment;

    return filesIn(dirs, [
      `**/${indexFile}`,
      ...(entryFile === undefined ? [] : [`**/${entryFile}`]),
    ]);
  });

  return [
    ...(await config.context.filesystem.glob(globs, {
      exclude: ["**/node_modules"],
    })),
  ];
}
