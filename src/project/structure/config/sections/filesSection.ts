import { flatMap } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { listDiscoveredGlobs } from "#project/structure/utils/listDiscoveredGlobs";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedFiles } from "#project/structure/types/ResolvedFiles";

export const filesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedFiles> {
    const [source, tests, bin, scripts, groups, roles] = await Promise.all([
      config.resolve("src"),
      config.resolve("tests"),
      config.resolve("bin"),
      config.resolve("scripts"),
      config.resolve("workspaces"),
      config.resolve("environmentRoles"),
    ]);

    const environments = [
      { ...source, roles: roles.src },
      { ...tests, roles: roles.tests },
      { ...bin, roles: roles.bin },
      { ...scripts, roles: roles.scripts },
    ];

    return freeze({
      generated: [
        ...flatMap(environments, ({ dirs, generated }) => {
          return filesIn(dirs, generated);
        }),
        ...flatMap(groups, ({ dirs, generated }) => filesIn(dirs, generated)),
      ],
      discovered: [
        ...flatMap(environments, ({ dirs, discovered, roles }) => {
          return filesIn(dirs, [...discovered, ...listDiscoveredGlobs(roles)]);
        }),
        ...flatMap(groups, ({ dirs, discovered }) => {
          return filesIn(dirs, discovered);
        }),
      ],
      fixtures: filesIn(tests.dirs, tests.fixtures),
      published: [...source.globs, ...bin.globs],
      private: [
        ...tests.globs,
        ...scripts.globs,
        ...flatMap(groups, ({ globs }) => globs),
      ],
    });
  },
});
