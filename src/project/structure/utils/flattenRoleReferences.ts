import { isString } from "@auaust/toolkit/isString";
import { freeze } from "@auaust/toolkit/object";

import { roleContractSchema } from "#project/structure/config/schemas/roleContractSchema";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { RoleReference } from "#project/structure/types/RoleReference";

export function flattenRoleReferences({
  owner,
  references,
  define,
}: {
  owner: string;
  references: readonly RoleReference[];
  define: Record<string, ResolvedRoleContract>;
}): string[] {
  const seen = new Set<string>();

  return references.map((reference) => {
    const local = isString(reference) ? reference : reference.name;

    if (seen.has(local)) {
      throw new Error(`${owner} lists the role ${local} twice`);
    }

    seen.add(local);

    if (isString(reference)) {
      return reference;
    }

    const { name, ...input } = reference;
    const registered = `${owner}/${name}`;

    const declared = roleContractSchema.resolve(
      input,
      undefined,
      `${owner}.roles.${name}`,
    );

    define[registered] = freeze({
      ...declared,
      roles:
        declared.roles === undefined
          ? undefined
          : flattenRoleReferences({
              owner: registered,
              references: declared.roles,
              define,
            }),
      scoped: true,
    });

    return registered;
  });
}
