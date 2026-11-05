import {
  buildSection,
  testsSection,
  type LoadedConfig,
} from "#project/config/index";
import { coverageTitle, outputTitle } from "#tools/git/constants";
import type { GlobGroup } from "#types/GlobGroup";

export async function createProjectIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const build = await config.resolve(buildSection);

  const outDir = await build.outDir;
  const { coverageDir } = await config.resolve(testsSection);

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
