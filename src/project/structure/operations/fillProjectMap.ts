import { renderProjectMap } from "#batiment/structure/index";
import { listMappedEnvironments } from "#project/structure/operations/listMappedEnvironments";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";

export async function fillProjectMap(
  config: LoadedConfig,
  directory?: Directory,
): Promise<string> {
  if (directory === undefined) {
    throw new Error(
      "@project-map expects the directory of the environment maps",
    );
  }

  const [{ structure }, environments, grants, roles, tests] = await Promise.all(
    [
      listMappedEnvironments(config),
      config.resolve("environments"),
      config.resolve("importGrants"),
      config.resolve("environmentRoles"),
      config.resolve("tests"),
    ],
  );

  return renderProjectMap({
    structure,
    environments: environments.map(({ entry, kind }) => {
      return {
        name: entry.name,
        title: entry.title,
        kind,
      };
    }),
    grants,
    roles,
    patterns: tests.patterns,
    directory,
  });
}
