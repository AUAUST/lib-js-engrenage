import { freeze, record } from "@auaust/toolkit/object";

import {
  dataEnvironment,
  sourceEnvironment,
} from "#batiment/structure/constants";
import type { EnvironmentInstance } from "#batiment/environments/index";
import type { ImportGrants } from "#batiment/structure/types/ImportGrants";

export function resolveEnvironmentGrants(
  published: boolean,
  environments: readonly EnvironmentInstance[],
): Pick<
  ImportGrants,
  "environments" | "data" | "elements" | "consumers" | "variants"
> {
  const categories = environments.filter(({ kind }) => {
    return kind.name !== sourceEnvironment;
  });

  const dataCategories = new Set(
    environments
      .filter(({ kind }) => kind.name === dataEnvironment)
      .map(({ name }) => name),
  );

  const forbidden = environments.map(({ name, kind }) => {
    const granted = new Set([
      ...(kind.imports ?? []),
      ...(kind.name === sourceEnvironment && !published
        ? [dataEnvironment]
        : []),
    ]);

    return [
      name,
      freeze(
        categories
          .filter((category) => {
            return category.name !== name && !granted.has(category.kind.name);
          })
          .map((category) => category.name),
      ),
    ] as const;
  });

  const consumers = freeze(
    environments
      .filter(({ kind }) => kind.consumesSource === true)
      .map(({ name }) => name),
  );

  return freeze({
    environments: freeze(
      record(
        forbidden.map(([name, categories]) => {
          return [
            name,
            freeze(
              categories.filter((category) => !dataCategories.has(category)),
            ),
          ] as const;
        }),
      ),
    ),
    data: freeze(
      forbidden
        .filter(([, categories]) => {
          return categories.some((category) => dataCategories.has(category));
        })
        .map(([name]) => name),
    ),
    elements: freeze(
      environments
        .filter(({ kind }) => kind.structure === "domains")
        .map(({ name }) => name),
    ),
    consumers,
    variants: published
      ? freeze({
          plain: freeze(["internal-aliases", ...consumers]),
          src: freeze(["public-entries"] as const),
          dist: freeze(["internal-aliases", ...consumers]),
        })
      : freeze({}),
  });
}
