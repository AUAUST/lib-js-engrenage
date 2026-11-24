import { flatMap } from "@auaust/toolkit/array";
import { values } from "@auaust/toolkit/object";

import { filesIn, type Filesystem } from "#foundation/filesystem/index";
import type { ResolvedStructure } from "#batiment/structure/index";
import type { File } from "#types/File";

export async function listBarrelCandidates(
  filesystem: Filesystem,
  structure: ResolvedStructure,
): Promise<File[]> {
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
    ...(await filesystem.glob(globs, {
      exclude: ["**/node_modules"],
    })),
  ];
}
