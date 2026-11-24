import { accessByVisibility } from "#project/package/constants";
import type { PackageField } from "#project/package/types/PackageField";
import type { Visibility } from "#project/package/types/Visibility";
import type { PackageName } from "#types/PackageName";

/**
 * The `package.json` fields every scope takes from its own config: its name
 * when it has one, its Node runtime, then its publish access when published,
 * else `private`.
 */
export function createScopeFields({
  name,
  node,
  published,
  visibility,
}: {
  name: PackageName | undefined;
  node: number;
  published: boolean;
  visibility: Visibility;
}): PackageField[] {
  return [
    ...(name === undefined
      ? []
      : [{ location: ["name"], value: name } as const]),
    {
      location: ["devEngines", "runtime"],
      value: {
        name: "node",
        version: String(node),
        onFail: "error",
      },
    },
    published
      ? {
          location: ["publishConfig", "access"],
          value: accessByVisibility[visibility],
        }
      : { location: ["private"], value: true },
  ];
}
