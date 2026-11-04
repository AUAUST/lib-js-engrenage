import type { PackageName } from "#types/PackageName";

export function isPackageAlias(packageName: PackageName, alias: string) {
  return alias === packageName || alias.startsWith(`${packageName}/`);
}
