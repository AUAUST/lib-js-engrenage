import { freeze, record } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import {
  readEnvironment,
  type ResolvedEnvironment,
} from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { readStructureMetadata } from "#project/structure/operations/readStructureMetadata";
import { readStructureOption } from "#project/structure/operations/readStructureOption";
import { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";
import { flattenStructure } from "#project/structure/utils/flattenStructure";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import { mergeStructureMetadata } from "#project/structure/utils/mergeStructureMetadata";
import type { ConfigResolver } from "#project/config/index";
import type { EnvironmentStructureOption } from "#project/structure/ports/EnvironmentStructureOption";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedStructure } from "#project/structure/types/ResolvedStructure";
import type { TestsContext } from "#project/structure/types/TestsContext";

interface StructuredEnvironment {
  readonly name: string;
  readonly environment: ResolvedEnvironment;
  readonly option: EnvironmentStructureOption;
}

async function resolveStructure(
  config: ConfigResolver,
  { name, environment, option }: StructuredEnvironment,
  tests?: TestsContext,
): Promise<EnvironmentStructure | undefined> {
  if (!option.enabled || !environment.active) {
    return;
  }

  const { internals } = await config.resolve("structure.options");

  const roles = listEnvironmentRoles(option);

  const { defined, ...declared } = flattenStructure({
    environment: name,
    structure: option.structure,
  });

  const metadata = await readStructureMetadata({
    root: config.context.root,
    dirs: environment.dirs,
  });

  const [mirrored] = tests === undefined ? [] : metadata;

  if (mirrored !== undefined) {
    throw new Error(
      `${mirrored.files.join(", ")} describes the mirrored ${name} environment, whose structure follows its counterparts`,
    );
  }

  const { namespaces, domains } = mergeStructureMetadata({
    environment: name,
    declared,
    metadata,
  });

  return resolveEnvironmentStructure({
    name,
    root: config.context.root,
    dirs: environment.dirs,
    options: {
      namespaces,
      domains,
      optOut: option.optOut,
      strictness: option.strictness,
    },
    ...(roles === undefined
      ? {}
      : { roles: await readEnvironmentRoles(config, roles) }),
    defined,
    internals,
    tree: option.tree,
    ...(tests === undefined ? {} : { tests }),
  });
}

function mirrorOf({ option }: StructuredEnvironment): boolean | undefined {
  return option.enabled ? option.mirror : undefined;
}

export const structureSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedStructure> {
    const environments = await config.resolve("environments");

    const structured = await Promise.all(
      environments
        .filter(({ structure }) => structure !== undefined)
        .map(async ({ name }): Promise<StructuredEnvironment> => {
          return {
            name,
            environment: await readEnvironment(config, name),
            option: await readStructureOption(config, name),
          };
        }),
    );

    const counterparts = structured.filter((entry) => {
      return mirrorOf(entry) === undefined;
    });

    const structures = new Map<string, EnvironmentStructure | undefined>();

    for (const entry of counterparts) {
      structures.set(entry.name, await resolveStructure(config, entry));
    }

    const tests = record(
      counterparts.map(({ name, environment }) => {
        return [
          name,
          { dirs: environment.dirs, structure: structures.get(name) },
        ] as const;
      }),
    );

    for (const entry of structured) {
      const mirror = mirrorOf(entry);

      if (mirror !== undefined) {
        structures.set(
          entry.name,
          await resolveStructure(config, entry, {
            mirror,
            environments: tests,
          }),
        );
      }
    }

    return freeze(
      record(
        structured.map(({ name }) => {
          return [name, structures.get(name)] as const;
        }),
      ),
    );
  },
});
