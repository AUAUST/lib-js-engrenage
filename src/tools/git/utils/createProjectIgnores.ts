import { coverageTitle, outputTitle } from "#tools/git/constants";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { GlobGroup } from "#types/GlobGroup";

export function createProjectIgnores(
  config: ProjectConfig,
): readonly GlobGroup[] {
  const { outDir } = config.build;
  const { coverageDir } = config.tests;

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
