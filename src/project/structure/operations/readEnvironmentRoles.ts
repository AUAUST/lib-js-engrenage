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
  scoped: boolean,
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

  const omitRoles = scoped
    ? option.omitRoles?.filter((name) => {
        return defaults.some((role) => role.name === name);
      })
    : option.omitRoles;

  return {
    roles: listNamespaceRoles({
      ...option,
      omitRoles,
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
 * languages `environments` select, every environment its namespace covers
 * by default, loaded once per config context. Given `environments`, the
 * environment's `omitRoles` must name defaults of its whole namespace, and drops
 * only those of `environments`.
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

  if (environments !== undefined) {
    // @debt a scoped read runs the namespace-wide read only for its omitRoles check, discarding its roles, instead of one validation both reads share
    await readEnvironmentRoles(config, environment);
  }

  let read = reads.get(key);

  if (read === undefined) {
    read = createEnvironmentRoles(
      config,
      environment,
      covered,
      environments !== undefined,
    );

    reads.set(key, read);
  }

  return read;
}
