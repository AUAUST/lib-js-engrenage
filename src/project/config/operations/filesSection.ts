import { flatMap } from "@auaust/primitive-kit/arrays";
import { freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { binSection } from "#project/config/operations/binSection";
import { scriptsSection } from "#project/config/operations/scriptsSection";
import { sourceSection } from "#project/config/operations/sourceSection";
import { testsSection } from "#project/config/operations/testsSection";
import { workspacesSection } from "#project/config/operations/workspacesSection";
import { listDiscoveredGlobs } from "#project/structure/index";
import type { ResolvedFiles } from "#project/config/types/ResolvedFiles";

export const filesSection = declareSection({
  name: "files",
  async resolve(_input, config): Promise<ResolvedFiles> {
    const [source, tests, bin, scripts, groups] = await Promise.all([
      config.resolve(sourceSection),
      config.resolve(testsSection),
      config.resolve(binSection),
      config.resolve(scriptsSection),
      config.resolve(workspacesSection),
    ]);

    const environments = [source, tests, bin, scripts];

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
