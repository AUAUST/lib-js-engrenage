import { flatMap } from "@auaust/primitive-kit/arrays";

import { findDirectories } from "#foundation/filesystem/index";
import { listLocationGlobs, type LoadedConfig } from "#project/config/index";
import { readEnvironments } from "#project/environments/index";
import { resolvePrettierArguments } from "#tools/prettier/operations/resolvePrettierArguments";

export async function resolvePrettierAllArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  const [
    environments,
    groups,
    resources,
    filesystem,
    resolve,
  ] = await Promise.all([
    readEnvironments(config),
    config.resolve("workspaces"),
    config.resolve("resources"),
    config.context.filesystem,
    config.context.path,
  ]);

  const directories = [
    ...flatMap(environments, ({ environment }) => environment.dirs),
    ...flatMap(groups, ({ dirs }) => dirs),
  ];

  const files = [
    ...flatMap(environments, ({ environment }) => {
      return environment.rootFiles ?? [];
    }),
    ...flatMap(resources.list({ formatted: true }), ({ location }) => {
      return listLocationGlobs(location);
    }),
  ];

  const paths = [
    ...(await findDirectories(filesystem, directories)),
    ...(await filesystem.glob(files)),
  ];

  return [
    ...resolvePrettierArguments(args),
    ...paths.map((path) => resolve(path)),
  ];
}
