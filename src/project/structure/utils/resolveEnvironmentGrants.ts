import { freeze, record } from "@auaust/toolkit/object";

import {
  dataEnvironment,
  sourceEnvironment,
} from "#project/structure/constants";
import type { ContributedEnvironmentEntry } from "#project/environments/index";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

export function resolveEnvironmentGrants(
  published: boolean,
  environments: readonly ContributedEnvironmentEntry[],
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
      .map(({ entry }) => entry.name),
  );

  const forbidden = environments.map(({ entry, kind }) => {
    const granted = new Set([
      ...(kind.imports ?? []),
      ...(kind.name === sourceEnvironment && !published
        ? [dataEnvironment]
        : []),
    ]);

    return [
      entry.name,
      freeze(
        categories
          .filter((category) => {
            return (
              category.entry.name !== entry.name &&
              !granted.has(category.kind.name)
            );
          })
          .map((category) => category.entry.name),
      ),
    ] as const;
  });

  const consumers = freeze(
    environments
      .filter(({ kind }) => kind.consumesSource === true)
      .map(({ entry }) => entry.name),
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
        .map(({ entry }) => entry.name),
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
