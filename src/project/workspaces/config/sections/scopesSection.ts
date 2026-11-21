import { posix } from "node:path";

import { flatMap, map } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import {
  createScopeTree,
  discoverEnvironment,
  getEnvironmentId,
  type ScopeTree,
} from "#batiment/scopes/index";
import { declareSection } from "#foundation/options/index";
import { readEnvironment } from "#project/environments/index";
import type { OptionSource } from "#batiment/report/index";
import type { ConfigResolver } from "#project/config/index";
import type { Glob } from "#types/Glob";

async function readDeclaredSource(
  config: ConfigResolver,
  glob: Glob,
): Promise<OptionSource> {
  const path = `workspaces.${glob}.purpose`;

  return {
    key: "workspaces",
    path,
    // @debt the origin path splits on dots, so a glob holding one resolves another path's origin
    origin: await config.origin("workspaces", path),
  };
}

export const scopesSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ScopeTree> {
    const [entries, groups, discovery] = await Promise.all([
      config.resolve("environments"),
      config.resolve("workspaces"),
      config.resolve("scopes.discovery"),
    ]);

    const environments = await Promise.all(
      entries.map(async ({ entry, kind }) => {
        const { dirs } = await readEnvironment(config, entry.name);

        return {
          name: entry.name,
          kind: kind.name,
          dirs,
        };
      }),
    );

    const workspaces = await Promise.all(
      discovery.workspaces.map(async ({ dir, file, purpose }) => {
        const group = groups.find(({ dirs }) => dirs.includes(dir));

        // @debt a workspace's environments are only its `.environment.json` dirs, with no defaults or multi-dir environments, until its child resolver declares them (#745)
        const found = await Promise.all(
          discovery.environments
            .filter((environment) => posix.dirname(environment.dir) === dir)
            .map(async ({ dir: environmentDir, kind }) => {
              const name = posix.basename(environmentDir);
              const dirs = [environmentDir];

              const { active } = await discoverEnvironment({
                name: getEnvironmentId(dir, name),
                dirs,
                files: [],
                claims: {},
                ignored: discovery.ignored,
                filesystem: config.context.filesystem,
              });

              return kind === undefined || !active
                ? []
                : [
                    {
                      name,
                      kind,
                      dirs,
                    },
                  ];
            }),
        );

        const declared = group?.purpose === undefined
          ? undefined
          : {
              value: group.purpose,
              config: await readDeclaredSource(config, group.glob),
            };

        return {
          dir,
          environments: found.flat(),
          ...(purpose === undefined
            ? {}
            : {
                purpose: { value: purpose, file },
              }),
          ...(declared === undefined ? {} : { declared }),
        };
      }),
    );

    const tree = createScopeTree({
      environments,
      workspaces,
      missing: flatMap(groups, ({ glob, missing }) => {
        return map(missing, (dir) => {
          return { dir, glob };
        });
      }),
    });

    return freeze({
      ...tree,
      diagnostics: freeze([...discovery.diagnostics, ...tree.diagnostics]),
    });
  },
});
