import { freeze, keys, record } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { getNamespaceCategory } from "#batiment/structure/utils/getNamespaceCategory";
import type {
  NamespaceGrant,
  NamespaceInstance,
  NamespaceRelation,
} from "#batiment/scopes/index";
import type { ImportCategory } from "#batiment/structure/types/ImportCategory";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

function capRelation(
  relation: NamespaceRelation | undefined,
  target: NamespaceInstance,
): NamespaceRelation | undefined {
  switch (target.kind.inward) {
    case "open": {
      return relation;
    }

    case "surface": {
      return relation === undefined ? undefined : "surface";
    }

    default:
  }
}

function resolveGrant(
  importer: NamespaceInstance,
  target: NamespaceInstance,
): NamespaceGrant | undefined {
  if (importer.scope !== target.scope) {
    return;
  }

  const granted = importer.kind.imports?.[target.kind.name];
  const optedIn = importer.imports?.[target.name];

  const relation = capRelation(
    granted === "whole" ? granted : (optedIn?.relation ?? granted),
    target,
  );

  if (relation !== undefined) {
    return optedIn?.dirs === undefined
      ? { relation }
      : { relation, dirs: optedIn.dirs };
  }
}

export function resolveNamespaceGrants(
  published: boolean,
  namespaces: readonly NamespaceInstance[],
): Pick<
  ImportGrants,
  "namespaces" | "surface" | "directories" | "elements" | "entries" | "variants"
> {
  // @debt only the root scope's namespaces hold the package entries, since the `internal-aliases` category names the root's aliases; each scope's own entries wait on per-scope aliases
  const entries = freeze(
    namespaces
      .filter(({ scope, kind }) => {
        return scope === rootScope && kind.entries === true;
      })
      .map(({ id }) => id),
  );

  const relations = namespaces.map((importer) => {
    const targets = namespaces
      .filter((target) => target.id !== importer.id)
      .map((target) => {
        return [target, resolveGrant(importer, target)] as const;
      });

    const forbidden = targets
      .filter(([, grant]) => grant === undefined)
      .map(([target]) => getNamespaceCategory(target.id, entries));

    const surface = targets
      .filter(([, grant]) => grant?.relation === "surface")
      .map(([target]) => target.id);

    const directories = targets.flatMap(([target, grant]) => {
      return grant?.dirs === undefined
        ? []
        : [[target.id, grant.dirs] as const];
    });

    return [
      importer.id,
      freeze(forbidden),
      freeze(surface),
      freeze(record(directories)),
    ] as const;
  });

  const consumers = relations
    .filter(([, , surface]) => surface.some((id) => entries.includes(id)))
    .map(([name]) => name);

  const reaches = freeze({
    "public-entries": freeze(["internal-aliases", ...consumers]),
    "internal-aliases": freeze(["public-entries"]),
  } as const satisfies Record<string, readonly ImportCategory[]>);

  const variants = namespaces.flatMap(({ kind }) => {
    return kind.variants ?? [];
  });

  return freeze({
    namespaces: freeze(
      record(relations.map(([name, forbidden]) => [name, forbidden] as const)),
    ),
    surface: freeze(
      record(
        relations
          .filter(([, , surface]) => surface.length > 0)
          .map(([name, , surface]) => [name, surface] as const),
      ),
    ),
    directories: freeze(
      record(
        relations
          .filter(([, , , directories]) => keys(directories).length > 0)
          .map(([name, , , directories]) => [name, directories] as const),
      ),
    ),
    elements: freeze(
      namespaces
        .filter(({ kind }) => kind.structure === "domains")
        .map(({ id }) => id),
    ),
    entries,
    variants: published
      ? freeze(
          record(
            variants.map(({ name, through }) => {
              return [name, reaches[through]] as const;
            }),
          ),
        )
      : freeze({}),
  });
}
