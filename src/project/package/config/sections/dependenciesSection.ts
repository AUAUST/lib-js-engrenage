import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import type { ConfigResolver, Dependencies } from "#project/config/index";
import type { PackageJson } from "#project/package/types/PackageJson";
import type { KnownPackageName } from "#types/KnownPackageName";
import type { PackageName } from "#types/PackageName";

const dependencies = new WeakMap<PackageJson, Dependencies>();

function createDependencies(packageJson: PackageJson): Dependencies {
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

export const dependenciesSection = declareSection({
  live: true,
  async resolve(_input, config: ConfigResolver): Promise<Dependencies> {
    const packageJson = await config.resolve("packageJson");

    const known = dependencies.get(packageJson);

    if (known !== undefined) {
      return known;
    }

    const created = createDependencies(packageJson);

    dependencies.set(packageJson, created);

    return created;
  },
});
