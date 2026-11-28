import { discoverNamespace } from "#batiment/context/index";
import { rootScope } from "#batiment/scopes/constants";
import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import { readEnvironmentOptions } from "#project/environments/operations/readEnvironmentOptions";
import type { ConfigResolver } from "#project/config/index";

/**
 * Reads the directories, root files and activity discovery gives the environment
 * in the scope `config` resolves, discovering that environment alone: no other
 * scope, environment or namespace kind. Paths are relative to the project
 * root, as discovery's.
 */
export async function discoverEnvironment(
  config: ConfigResolver,
  name: string,
) {
  const entries = await listEnvironmentEntries(config);

  if (!entries.some(({ entry }) => entry.name === name)) {
    throw new Error(
      `Discovery placed no ${name} environment: no active extension contributes it`,
    );
  }

  const [{ option }, claims, { ignored }, root] = await Promise.all([
    readEnvironmentOptions(config, name),
    config.resolve("environments.claims"),
    config.resolve("git"),
    config.context.scope(rootScope),
  ]);

  // @debt reads the placement, claims and ignored files discovery's port reads in `createResolverContext`, a second reading of those inputs kept in step only by its test
  return discoverNamespace({
    scope: config.context.scopeDir,
    name,
    dirs: option.dirs,
    files: option.files ?? [],
    claims,
    ignored: await ignored,
    filesystem: root.context.filesystem,
  });
}
