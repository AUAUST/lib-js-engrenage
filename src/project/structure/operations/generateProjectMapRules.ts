import { entries, values } from "@auaust/toolkit/object";

import { projectMapRule } from "#project/structure/constants";
import { listMappedEnvironments } from "#project/structure/operations/listMappedEnvironments";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";
import type { Globs } from "#types/Globs";

export async function generateProjectMapRules(
  config: LoadedConfig,
  directory: Directory,
): Promise<
  readonly {
    name: string;
    paths?: Globs;
    directives: readonly string[];
  }[]
> {
  const { structure, paths } = await listMappedEnvironments(config);

  if (values(structure).every((environment) => environment === undefined)) {
    return [];
  }

  const mapped = entries(structure).filter(([, environment]) => {
    return environment !== undefined;
  });

  return [
    {
      name: projectMapRule,
      paths: mapped.flatMap(([name]) => {
        return paths[name] ?? [];
      }),
      directives: [`project-map ${directory}/${projectMapRule}`],
    },
    ...mapped.map(([name]) => {
      return {
        name: `${projectMapRule}/${name}`,
        paths: paths[name] ?? [],
        directives: [`environment-map ${name}`],
      };
    }),
  ];
}
