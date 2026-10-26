import { coverageIgnores, outputTitle } from "#git/constants";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { GlobGroup } from "#types/GlobGroup";

export function createProjectIgnores(
  config: ResolvedConfig,
): ReadonlyArray<GlobGroup> {
  const { output } = config.directories;

  return [
    ...(output === undefined
      ? []
      : [
          {
            title: outputTitle,
            globs: [`/${output}`],
          },
        ]),
    coverageIgnores,
  ];
}
