import { onlyAllowScript } from "#pnpm/constants";
import { writePnpmDeclaration } from "#pnpm/utils/writePnpmDeclaration";
import { writeJsonValue } from "#support/json/utils/writeJsonValue";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { File } from "#types/File";

export function upgradePnpmManifest(
  content: string,
  path: File,
  packageJson: PackageJson,
  version: string,
): string {
  const { packageManager, scripts } = packageJson.optional;

  let upgraded = writePnpmDeclaration(content, path, packageJson, version);

  if (packageManager !== undefined) {
    upgraded = writeJsonValue(upgraded, path, ["packageManager"], undefined);
  }

  if (scripts?.["preinstall"] === onlyAllowScript) {
    upgraded = writeJsonValue(
      upgraded,
      path,
      ["scripts", "preinstall"],
      undefined,
    );
  }

  return upgraded;
}
