import { coverageTitle, outputTitle } from "#git/constants";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { GlobGroup } from "#types/GlobGroup";

export function createProjectIgnores(
  config: ResolvedConfig,
): readonly GlobGroup[] {
  const { outDir } = config.build;
  const { coverageDir } = config.test;

  return [
    ...(outDir === undefined
      ? []
      : [
          {
            title: outputTitle,
            globs: [`/${outDir}`],
          },
        ]),
    {
      title: coverageTitle,
      globs: [`/${coverageDir}`],
    },
  ];
}
