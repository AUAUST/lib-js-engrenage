import { entries, freeze, record } from "@auaust/toolkit/object";

import { completeRole } from "#project/structure/utils/completeRole";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { RoleDefinition } from "#project/structure/types/RoleDefinition";

interface Version {
  readonly definition: RoleDefinition | undefined;
  resolved: ResolvedRoleContract | undefined;
}

function pickGiven(definition: RoleDefinition): Partial<RoleDefinition> {
  return record(
    entries(definition).filter(([field, value]) => {
      return field !== "inherit" && value !== undefined;
    }),
  );
}

export function resolveRoleContracts({
  catalogue,
  layers,
}: {
  catalogue: Readonly<Record<string, ResolvedRoleContract>>;
  layers: readonly Readonly<Record<string, RoleDefinition>>[];
}): Record<string, ResolvedRoleContract> {
  const versions = new Map<string, Version[]>();

  function add(name: string, version: Version) {
    versions.set(name, [...(versions.get(name) ?? []), version]);
  }

  for (const [name, resolved] of entries(catalogue)) {
    add(name, { definition: undefined, resolved });
  }

  for (const layer of layers) {
    for (const [name, definition] of entries(layer)) {
      add(name, { definition, resolved: undefined });
    }
  }

  const visiting: string[] = [];

  function resolveVersion(name: string, index: number): ResolvedRoleContract {
    const version = versions.get(name)?.[index];

    if (version === undefined) {
      throw new Error(
        `The role ${name} inherits itself, but no earlier layer defines it`,
      );
    }

    if (version.resolved !== undefined) {
      return version.resolved;
    }

    const key = `${name}#${index}`;

    if (visiting.includes(key)) {
      const path = [...visiting.slice(visiting.indexOf(key)), key];

      throw new Error(
        `Role inheritance is cyclic: ${path.map((step) => step.slice(0, step.lastIndexOf("#"))).join(" -> ")}`,
      );
    }

    const { definition } = version;

    visiting.push(key);

    const base =
      definition?.inherit === undefined
        ? undefined
        : resolveInherited(name, index, definition.inherit);

    visiting.pop();

    version.resolved = completeRole({
      ...base,
      ...(definition === undefined ? {} : pickGiven(definition)),
    });

    return version.resolved;
  }

  function resolveInherited(
    name: string,
    index: number,
    inherit: string,
  ): ResolvedRoleContract {
    if (inherit === name) {
      return resolveVersion(name, index - 1);
    }

    const target = versions.get(inherit);

    if (target === undefined) {
      throw new Error(
        `The role ${name} inherits ${inherit}, which is not defined`,
      );
    }

    return resolveVersion(inherit, target.length - 1);
  }

  return record(
    [...versions].map(([name, found]) => {
      return [name, freeze(resolveVersion(name, found.length - 1))] as const;
    }),
  );
}
