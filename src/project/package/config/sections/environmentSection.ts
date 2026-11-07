import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { packageJsonSection } from "#project/package/config/sections/packageJsonSection";
import type { Environment } from "#project/config/index";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { PackageName } from "#types/PackageName";

const environments = new WeakMap<PackageJson, Environment>();

function createEnvironment(packageJson: PackageJson): Environment {
  const { optional } = packageJson;

  const packages = new Set<PackageName>(optional.dependencies);

  if (optional.name !== undefined) {
    packages.add(optional.name);
  }

  function hasDependency(name: PackageName): name is KnownPackageName {
    return packages.has(name);
  }

  return freeze({
    hasDependency,
  });
}

export const environmentSection = declareSection({
  name: "environment",
  live: true,
  async resolve(_input, config): Promise<Environment> {
    const packageJson = await config.resolve(packageJsonSection);

    const known = environments.get(packageJson);

    if (known !== undefined) {
      return known;
    }

    const created = createEnvironment(packageJson);

    environments.set(packageJson, created);

    return created;
  },
});
