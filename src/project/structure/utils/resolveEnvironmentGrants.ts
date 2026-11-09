import { freeze, record } from "@auaust/toolkit/object";

import {
  dataEnvironment,
  sourceEnvironment,
} from "#project/structure/constants";
import type { EnvironmentEntry } from "#project/environments/index";
import type { ImportGrants } from "#project/structure/types/ImportGrants";

export function resolveEnvironmentGrants(
  published: boolean,
  environments: readonly EnvironmentEntry[],
): Pick<
  ImportGrants,
  "environments" | "data" | "elements" | "consumers" | "variants"
> {
  const categories = environments
    .map(({ name }) => name)
    .filter((name) => name !== sourceEnvironment);

  const forbidden = environments.map(({ name, imports = [] }) => {
    const granted = new Set([
      name,
      ...imports,
      ...(name === sourceEnvironment && !published ? [dataEnvironment] : []),
    ]);

    return [
      name,
      freeze(categories.filter((category) => !granted.has(category))),
    ] as const;
  });

  return freeze({
    environments: freeze(
      record(
        forbidden.map(([name, categories]) => {
          return [
            name,
            freeze(
              categories.filter((category) => category !== dataEnvironment),
            ),
          ] as const;
        }),
      ),
    ),
    data: freeze(
      forbidden
        .filter(([, categories]) => categories.includes(dataEnvironment))
        .map(([name]) => name),
    ),
    elements: freeze(
      environments
        .filter(({ structure }) => structure === "domains")
        .map(({ name }) => name),
    ),
    consumers: freeze(
      environments
        .filter(({ consumesSource }) => consumesSource === true)
        .map(({ name }) => name),
    ),
    variants: published
      ? freeze({
          plain: freeze(["internal-aliases", "bin"] as const),
          src: freeze(["public-entries"] as const),
          dist: freeze(["internal-aliases", "bin"] as const),
        })
      : freeze({}),
  });
}
