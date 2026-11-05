import { coverageTitle, outputTitle } from "#tools/git/constants";
import type { OptionContext } from "#foundation/options/index";
import type { ResolvedBuild } from "#project/build/index";
import type { ResolvedTests } from "#project/environments/index";
import type { GlobGroup } from "#types/GlobGroup";

export async function createProjectIgnores(
  config: OptionContext<{ build: ResolvedBuild; tests: ResolvedTests }>,
): Promise<readonly GlobGroup[]> {
  const build = await config.get("build");

  const outDir = await build.outDir;
  const { coverageDir } = await config.get("tests");

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
