import { freeze, record } from "@auaust/toolkit/object";

import { sourceEnvironment } from "#batiment/structure/constants";
import { getEnvironmentCategory } from "#batiment/structure/utils/getEnvironmentCategory";
import type {
  NamespaceInstance,
  NamespaceRelation,
} from "#batiment/scopes/index";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

function resolveRelation(
  importer: NamespaceInstance,
  target: NamespaceInstance,
): NamespaceRelation | undefined {
  if (importer.scope !== target.scope) {
    return;
  }

  const relation = importer.kind.imports?.[target.kind.name];

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

export function resolveEnvironmentGrants(
  published: boolean,
  namespaces: readonly NamespaceInstance[],
): Pick<ImportGrants, "environments" | "surface" | "elements" | "variants"> {
  const relations = namespaces.map((importer) => {
    const targets = namespaces
      .filter((target) => target.id !== importer.id)
      .map((target) => {
        return [target, resolveRelation(importer, target)] as const;
      });

    const forbidden = targets
      .filter(([, relation]) => relation === undefined)
      .map(([target]) => getEnvironmentCategory(target.id));

    const surface = targets
      .filter(([, relation]) => relation === "surface")
      .map(([target]) => target.id);

    return [importer.id, freeze(forbidden), freeze(surface)] as const;
  });

  const consumers = relations
    .filter(([, , surface]) => surface.includes(sourceEnvironment))
    .map(([name]) => name);

  return freeze({
    environments: freeze(
      record(relations.map(([name, forbidden]) => [name, forbidden] as const)),
    ),
    surface: freeze(
      record(
        relations
          .filter(([, , surface]) => surface.length > 0)
          .map(([name, , surface]) => [name, surface] as const),
      ),
    ),
    elements: freeze(
      namespaces
        .filter(({ kind }) => kind.structure === "domains")
        .map(({ id }) => id),
    ),
    variants: published
      ? freeze({
          plain: freeze(["internal-aliases", ...consumers]),
          src: freeze(["public-entries"] as const),
          dist: freeze(["internal-aliases", ...consumers]),
        })
      : freeze({}),
  });
}
