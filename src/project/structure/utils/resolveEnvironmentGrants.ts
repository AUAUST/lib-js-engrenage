import { freeze } from "@auaust/toolkit/object";

import type { ImportGrants } from "#project/structure/types/ImportGrants";

export function resolveEnvironmentGrants(
  published: boolean,
): Pick<ImportGrants, "environments" | "data" | "variants"> {
  return freeze({
    environments: freeze({
      src: freeze(["bin", "scripts", "tests"] as const),
      bin: freeze(["scripts", "tests"] as const),
      scripts: freeze(["bin", "tests"] as const),
      tooling: freeze(["bin", "scripts", "tests"] as const),
    }),
    data: freeze(
      published
        ? (["bin", "tooling", "src"] as const)
        : (["bin", "tooling"] as const),
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
