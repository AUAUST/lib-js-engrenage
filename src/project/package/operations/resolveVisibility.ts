import { entries } from "@auaust/toolkit/object";

import { accessByVisibility } from "#project/package/constants";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { Visibility } from "#project/package/types/Visibility";

export function resolveVisibility(
  declared: Visibility | undefined,
  packageJson: PackageJson,
): Visibility {
  if (declared !== undefined) {
    return declared;
  }

  const access = packageJson.optional.publishConfig?.access;

  const derived = entries(accessByVisibility).find(([, value]) => {
    return value === access;
  });

  return derived?.[0] ?? "private";
}
