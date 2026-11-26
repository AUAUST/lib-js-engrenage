import { flatMap } from "@auaust/toolkit/array";
import { freeze, getOwn } from "@auaust/toolkit/object";

import { noRoles } from "#batiment/roles/constants";
import { listDiscoveredGlobs } from "#batiment/roles/index";
import { filesIn } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { listLocationGlobs, type ConfigResolver } from "#project/config/index";
import {
  readEnvironments,
  type ContributedEnvironment,
} from "#project/environments/index";
import { listGenerators } from "#project/generators/index";
import { listScopeConfigs } from "#project/workspaces/index";
import type { ResolvedFiles } from "#project/structure/types/ResolvedFiles";
import type { Globs } from "#types/Globs";

function shippedGlobs(
  environments: readonly ContributedEnvironment[],
  code: "published" | "private",
): Globs {
  return flatMap(environments, ({ namespace, environment }) => {
    return namespace.code === code ? (environment.globs ?? []) : [];
  });
}

async function listFixtures(scopes: readonly ConfigResolver[]): Promise<Globs> {
  const fixtures = await Promise.all(
    scopes.map(async (scope) => {
      const tests = await scope.resolve("tests");

      return filesIn(tests.dirs, tests.fixtures);
    }),
  );

  return fixtures.flat();
}

export const filesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedFiles> {
    const [
      environments,
      scopes,
      groups,
      roles,
      resources,
      generators,
    ] = await Promise.all([
      readEnvironments(config),
      listScopeConfigs(config),
      config.resolve("workspaces"),
      config.resolve("environmentRoles"),
      config.resolve("resources"),
      listGenerators(config),
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
        ...flatMap(generators, ({ outputs }) => outputs),
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
      fixtures: await listFixtures(scopes),
      published: shippedGlobs(environments, "published"),
      private: [
        ...shippedGlobs(environments, "private"),
        ...flatMap(groups, ({ globs }) => globs),
      ],
    });
  },
});
