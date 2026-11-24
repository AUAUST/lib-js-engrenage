import { posix } from "node:path";

import {
  getDirectoryEnvironment,
  getEnvironmentCoverage,
  type EnvironmentPlacement,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
import { filesIn, withExtensions } from "#foundation/filesystem/index";
import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import { listLanguageFiles } from "#project/environments/utils/listLanguageFiles";
import type { ConfigResolver } from "#project/config/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

function listSubtreeGlobs(
  dir: Directory,
  excluded: Directories,
  languages: readonly LanguageEntry[],
): Globs {
  if (excluded.length === 0) {
    return filesIn(dir, listLanguageFiles(languages));
  }

  const children = new Map<string, Directory[]>();

  for (const below of excluded) {
    const [child = ""] = below.slice(dir.length + 1).split("/");

    const nested = children.get(child) ?? [];

    nested.push(below);
    children.set(child, nested);
  }

  const direct = languages.map((language) => {
    return withExtensions("*", language.extensions);
  });

  const others = `!(${[...children.keys()].join("|")})`;

  return [
    ...filesIn(dir, direct),
    ...filesIn(`${dir}/${others}`, listLanguageFiles(languages)),
    ...[...children].flatMap(([child, nested]) => {
      const childDir = `${dir}/${child}`;

      return nested.includes(childDir)
        ? []
        : listSubtreeGlobs(childDir, nested, languages);
    }),
  ];
}

/**
 * Lists the directories `environment` covers from `dir`, which it is placed at or
 * below: `dir` itself, and its own placements nested in another environment's,
 * each with the other environments' placements below it to leave out.
 */
function listCoveredRegions(
  placements: EnvironmentPlacements,
  environment: string,
  dir: Directory,
  nested: readonly EnvironmentPlacement[],
): readonly { dir: Directory; excluded: Directories }[] {
  const others = nested.filter((placement) => {
    return placement.environment !== environment;
  });

  const reentries = nested.filter((placement) => {
    return (
      placement.environment === environment &&
      getDirectoryEnvironment(placements, posix.dirname(placement.dir)) !==
        environment
    );
  });

  return [dir, ...reentries.map((placement) => placement.dir)].map((region) => {
    return {
      dir: region,
      excluded: others
        .filter((placement) => placement.dir.startsWith(`${region}/`))
        .map((placement) => placement.dir),
    };
  });
}

/**
 * Lists the globs of the language files under `dirs` of the environment placed
 * at or above each directory, leaving out the subtrees other environments'
 * directory placements nested below it cover.
 */
export async function listPlacementGlobs(
  config: ConfigResolver,
  dirs: Directories,
): Promise<Globs> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const { placements } = environments;

  const globs = await Promise.all(
    dirs.map(async (dir) => {
      const { environment, nested } = getEnvironmentCoverage(placements, dir);

      if (environment === undefined) {
        return [];
      }

      const languages = await readEnvironmentLanguages(config, environment);

      return listCoveredRegions(placements, environment, dir, nested).flatMap(
        (region) => {
          return listSubtreeGlobs(region.dir, region.excluded, languages);
        },
      );
    }),
  );

  return globs.flat();
}
