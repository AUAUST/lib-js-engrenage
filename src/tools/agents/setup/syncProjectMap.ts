import { entries, freeze, values } from "@auaust/toolkit/object";

import { findDirectories } from "#foundation/filesystem/index";
import { projectMapDirectory } from "#tools/agents/constants";
import { renderProjectMap } from "#tools/agents/utils/renderProjectMap";
import type { LoadedConfig } from "#project/config/index";
import type { Globs } from "#types/Globs";

export async function syncProjectMap({ resolve, context }: LoadedConfig) {
  const [
    filesystem,
    agents,
    structure,
    aliases,
    grants,
    roles,
    environments,
    tests,
    tooling,
  ] = await Promise.all([
    context.filesystem,
    resolve("agents"),
    resolve("structure"),
    resolve("aliases"),
    resolve("importGrants"),
    resolve("environmentRoles"),
    resolve("environments"),
    resolve("tests"),
    resolve("tooling"),
  ]);

  if (
    (agents.preferred?.length ?? 0) === 0 ||
    values(structure).every((environment) => environment === undefined)
  ) {
    return;
  }

  const mapped = { ...structure };
  const paths: Partial<Record<string, Globs>> = {};

  for (const [name, environment] of entries(structure)) {
    if (environment === undefined) {
      continue;
    }

    // @debt the tooling environment's root files are read by its name; the environment contract could carry the root files of any environment
    const files = name === "tooling" ? tooling.files : [];

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

  const maps = renderProjectMap({
    structure: freeze(mapped),
    paths: freeze(paths),
    environments,
    grants,
    roles,
    aliases: [...aliases.global, ...aliases.src],
    patterns: tests.patterns,
  });

  await Promise.all(
    maps.map(({ file, content }) => filesystem.write(file, content)),
  );

  const written = new Set(maps.map(({ file }) => file));

  for (const file of await filesystem.glob(`${projectMapDirectory}/*.md`)) {
    if (!written.has(file)) {
      await filesystem.remove(file);
    }
  }
}
