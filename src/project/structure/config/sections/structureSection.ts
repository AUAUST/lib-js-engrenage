import {
  flattenStructure,
  listContestedOptionPaths,
  readStructureMetadata,
  resolveStructure,
  type DeclaredEnvironment,
  type ResolvedStructure,
} from "#batiment/structure/index";
import { declareSection, type ValueOrigin } from "#foundation/options/index";
import { getOptionsKey, readEnvironment } from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { readStructureOption } from "#project/structure/operations/readStructureOption";
import type { ConfigResolver } from "#project/config/index";

async function readOrigins(
  config: ConfigResolver,
  key: string,
  paths: readonly string[],
): Promise<ReadonlyMap<string, ValueOrigin>> {
  const unique = [...new Set(paths)];

  const origins = await Promise.all(
    unique.map(async (path) => {
      return [path, await config.origin(key, path)] as const;
    }),
  );

  return new Map(origins);
}

export const structureSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedStructure> {
    const [
      environments,
      { internals },
      { published },
      discovery,
    ] = await Promise.all([
      config.resolve("environments"),
      config.resolve("structure.options"),
      config.resolve("traits"),
      config.resolve("scopes.discovery"),
    ]);

    const { filesystem } = config.context;

    const declared = await Promise.all(
      environments
        .filter(({ kind }) => kind.structure !== undefined)
        .map(async (contributed): Promise<DeclaredEnvironment> => {
          const { name } = contributed.entry;
          const key = getOptionsKey(contributed);

          const { dirs, active } = await readEnvironment(config, name);

          const { option, layout } = await readStructureOption(config, name);

          if (!option.enabled || !active) {
            return {
              name,
              key,
              dirs,
              active,
              option,
              layout,
              roles: undefined,
              declared: undefined,
              read: undefined,
              origins: new Map(),
            };
          }

          const flattened = flattenStructure({
            environment: name,
            root: `${name}.structure`,
            structure: option.structure,
            published,
          });

          const read = await readStructureMetadata({
            environment: name,
            filesystem,
            dirs,
            metafiles: discovery.environments,
          });

          const origins = layout?.nature !== "derived"
            ? await readOrigins(
                config,
                key,
                listContestedOptionPaths({
                  declared: flattened,
                  metadata: read.metadata,
                  optionPaths: flattened.optionPaths,
                }),
              )
            : new Map<string, ValueOrigin>();

          return {
            name,
            key,
            dirs,
            active,
            option,
            layout,
            roles: await readEnvironmentRoles(config, name),
            declared: flattened,
            read,
            origins,
          };
        }),
    );

    return resolveStructure({
      filesystem,
      internals,
      environments: declared,
    });
  },
});
