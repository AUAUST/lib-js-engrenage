import { toSorted } from "@auaust/toolkit/array";

import { listNamespaceRoles, type NamespaceRoles } from "#batiment/roles/index";
import { memoizeByContext, type ConfigResolver } from "#project/config/index";
import { listNamespaceEnvironments } from "#project/environments/index";
import { listDefaultRoles } from "#project/structure/operations/listDefaultRoles";
import { readStructureOption } from "#project/structure/operations/readStructureOption";

const readsFor = memoizeByContext(() => {
  return new Map<string, Promise<NamespaceRoles | undefined>>();
});

async function createEnvironmentRoles(
  config: ConfigResolver,
  environment: string,
  environments: readonly string[],
): Promise<NamespaceRoles | undefined> {
  const { option, layout } = await readStructureOption(config, environment);

  if (!option.enabled) {
    return;
  }

  const [
    defaults,
    { effects },
    { verbatimModuleSyntax: typeImports },
    defaultModules,
    { published },
  ] = await Promise.all([
    listDefaultRoles(config, environment, environments),
    config.resolve("structure.options"),
    config.resolve("typescript.options"),
    config.resolve("effectModules"),
    config.resolve("traits"),
  ]);

  return {
    roles: listNamespaceRoles({
      ...option,
      namespace: environment,
      defaults,
      layoutRoles: layout?.nature === "recursive" ? layout.roles : [],
    }),
    effects,
    defaultModules,
    typeImports,
    published,
  };
}

/**
 * Reads the roles of an environment, its default role presets those of the
 * languages `environments` select, every environment its namespace covers by
 * default, loaded once per config context.
 *
 * @returns Nothing when the environment's structure is disabled.
 */
export async function readEnvironmentRoles(
  config: ConfigResolver,
  environment: string,
  environments?: readonly string[],
): Promise<NamespaceRoles | undefined> {
  const covered = (
    environments ??
    (await listNamespaceEnvironments(config, (_kind, name) => {
      return name === environment;
    }))
  );

  const reads = readsFor(config.context);
  const key = [environment, ...toSorted(covered)].join("\0");

  let read = reads.get(key);

  if (read === undefined) {
    read = createEnvironmentRoles(config, environment, covered);

    reads.set(key, read);
  }

  return read;
}
