import { coverageTitle, outputTitle } from "#tools/git/constants";
import type { LoadedConfig } from "#project/config/index";
import type { GlobGroup } from "#types/GlobGroup";

export async function createProjectIgnores(
  config: LoadedConfig,
): Promise<readonly GlobGroup[]> {
  const outDir = await config.resolve("build.outDir");

  const { coverageDir } = await config.resolve("tests");

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
