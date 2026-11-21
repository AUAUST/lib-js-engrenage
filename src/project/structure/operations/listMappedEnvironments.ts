import { entries, freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { readEnvironment } from "#project/environments/index";
import type { ResolvedStructure } from "#batiment/structure/index";
import type { LoadedConfig } from "#project/config/index";
import type { Globs } from "#types/Globs";

export async function listMappedEnvironments(config: LoadedConfig): Promise<{
  structure: ResolvedStructure;
  paths: Readonly<Partial<Record<string, Globs>>>;
}> {
  const structure = await config.resolve("structure");

  const mapped = { ...structure };
  const paths: Partial<Record<string, Globs>> = {};

  for (const [name, environment] of entries(structure)) {
    if (environment === undefined) {
      continue;
    }

    const {
      rootFiles: files = [],
      active,
    } = await readEnvironment(config, name);

    if (!active) {
      mapped[name] = undefined;

      continue;
    }

    paths[name] = freeze([...filesIn(environment.dirs, "**"), ...files]);
  }

  return { structure: freeze(mapped), paths: freeze(paths) };
}
