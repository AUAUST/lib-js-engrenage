import { freeze, record } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import {
  readEnvironment,
  type ResolvedEnvironment,
} from "#project/environments/index";
import { readEnvironmentRoles } from "#project/structure/operations/readEnvironmentRoles";
import { readStructureOption } from "#project/structure/operations/readStructureOption";
import { resolveEnvironmentStructure } from "#project/structure/operations/resolveEnvironmentStructure";
import { listEnvironmentRoles } from "#project/structure/utils/listEnvironmentRoles";
import { normalizeNamespaces } from "#project/structure/utils/normalizeNamespaces";
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

  const { namespaces, defined } = normalizeNamespaces({
    environment: name,
    namespaces: option.namespaces,
  });

  return resolveEnvironmentStructure({
    name,
    root: config.context.root,
    dirs: environment.dirs,
    options: { ...option, namespaces },
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
