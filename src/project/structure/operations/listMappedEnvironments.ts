import { entries, freeze } from "@auaust/toolkit/object";

import { findDirectories } from "#foundation/filesystem/index";
import { readEnvironment } from "#project/environments/index";
import type { LoadedConfig } from "#project/config/index";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { Globs } from "#types/Globs";

export async function listMappedEnvironments(config: LoadedConfig): Promise<{
  structure: ResolvedStructure;
  paths: Readonly<Partial<Record<string, Globs>>>;
}> {
  const [filesystem, structure] = await Promise.all([
    config.context.filesystem,
    config.resolve("structure"),
  ]);

  const mapped = { ...structure };
  const paths: Partial<Record<string, Globs>> = {};

  for (const [name, environment] of entries(structure)) {
    if (environment === undefined) {
      continue;
    }

    const { rootFiles: files = [] } = await readEnvironment(config, name);

    const directories = await findDirectories(filesystem, environment.dirs);

    const matches = files.length === 0 ? [] : await filesystem.glob(files);

    if (directories.length === 0 && matches.length === 0) {
      mapped[name] = undefined;

      continue;
    }

    paths[name] = freeze([
      ...environment.dirs.map((dir) => {
        return dir === "." ? "**" : `${dir}/**`;
      }),
      ...files,
    ]);
  }

  return { structure: freeze(mapped), paths: freeze(paths) };
}
