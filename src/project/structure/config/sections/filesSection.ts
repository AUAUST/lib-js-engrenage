import { flatMap } from "@auaust/primitive-kit/arrays";
import { freeze, getOwn } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { listLocationGlobs, type ConfigResolver } from "#project/config/index";
import {
  readEnvironments,
  type ContributedEnvironment,
} from "#project/environments/index";
import { noRoles } from "#project/structure/constants";
import { listDiscoveredGlobs } from "#project/structure/utils/listDiscoveredGlobs";
import type { ResolvedFiles } from "#project/structure/types/ResolvedFiles";
import type { Globs } from "#types/Globs";

function shippedGlobs(
  environments: readonly ContributedEnvironment[],
  code: "published" | "private",
): Globs {
  return flatMap(environments, ({ entry, environment }) => {
    return entry.code === code ? (environment.globs ?? []) : [];
  });
}

export const filesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedFiles> {
    const [environments, tests, groups, roles, resources] = await Promise.all([
      readEnvironments(config),
      config.resolve("tests"),
      config.resolve("workspaces"),
      config.resolve("environmentRoles"),
      config.resolve("resources"),
    ]);

    return freeze({
      generated: [
        ...flatMap(environments, ({ environment: { dirs, generated } }) => {
          return filesIn(dirs, generated ?? []);
        }),
        ...flatMap(groups, ({ dirs, generated }) => filesIn(dirs, generated)),
        ...flatMap(resources.list({ generated: true }), ({ location }) => {
          return listLocationGlobs(location);
        }),
      ],
      discovered: [
        ...flatMap(environments, ({ entry, environment }) => {
          const { dirs, discovered } = environment;

          const environmentRoles = getOwn(roles, entry.name) ?? noRoles;

          return filesIn(dirs, [
            ...(discovered ?? []),
            ...listDiscoveredGlobs(environmentRoles),
          ]);
        }),
        ...flatMap(groups, ({ dirs, discovered }) => {
          return filesIn(dirs, discovered);
        }),
      ],
      fixtures: filesIn(tests.dirs, tests.fixtures),
      published: shippedGlobs(environments, "published"),
      private: [
        ...shippedGlobs(environments, "private"),
        ...flatMap(groups, ({ globs }) => globs),
      ],
    });
  },
});
