import { memoizeByContext, type ConfigResolver } from "#project/config/index";
import { listDefaultRoles } from "#project/structure/operations/listDefaultRoles";
import { readStructureOption } from "#project/structure/operations/readStructureOption";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import type { EnvironmentRoles } from "#project/structure/types/EnvironmentRoles";

const readsFor = memoizeByContext(() => {
  return new Map<string, Promise<EnvironmentRoles | undefined>>();
});

async function createEnvironmentRoles(
  config: ConfigResolver,
  environment: string,
): Promise<EnvironmentRoles | undefined> {
  const option = await readStructureOption(config, environment);

  if (!option.enabled) {
    return;
  }

  const [
    defaults,
    { effects },
    { verbatimModuleSyntax },
    defaultModules,
    { published },
  ] = await Promise.all([
    listDefaultRoles(config, environment),
    config.resolve("structure.options"),
    config.resolve("typescript.options"),
    config.resolve("effectModules"),
    config.resolve("traits"),
  ]);

  return {
    roles: listEnvironmentRoles({
      ...option,
      environment,
      defaults,
    }),
    effects,
    defaultModules,
    verbatimModuleSyntax,
    published,
  };
}

/**
 * Reads the roles of an environment, its default role presets loaded once
 * per config context.
 *
 * @returns Nothing when the environment's structure is disabled.
 */
export function readEnvironmentRoles(
  config: ConfigResolver,
  environment: string,
): Promise<EnvironmentRoles | undefined> {
  const reads = readsFor(config.context);

  let read = reads.get(environment);

  if (read === undefined) {
    read = createEnvironmentRoles(config, environment);

    reads.set(environment, read);
  }

  return read;
}
