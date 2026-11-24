import { accessByVisibility } from "#project/package/constants";
import type { PackageField } from "#project/package/types/PackageField";
import type { Visibility } from "#project/package/types/Visibility";

/**
 * The `package.json` fields every scope takes from its own config: its Node
 * runtime, then its publish access when published, else `private`.
 */
export function createScopeFields({
  node,
  published,
  visibility,
}: {
  node: number;
  published: boolean;
  visibility: Visibility;
}): PackageField[] {
  return [
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
