import { buildOutDirSection } from "#project/build/index";
import { testsSection } from "#project/environments/index";
import { coverageTitle, outputTitle } from "#tools/git/constants";
import type { LoadedConfig } from "#project/config/index";
import type { GlobGroup } from "#types/GlobGroup";

export async function createProjectIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const outDir = await config.resolve(buildOutDirSection);

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
