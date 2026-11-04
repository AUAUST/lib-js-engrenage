import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";
import { jsonIndentation } from "#project/format/constants";
import { onlyAllowScript } from "#tools/pnpm/constants";
import { writePnpmDeclaration } from "#tools/pnpm/operations/writePnpmDeclaration";
import type { PackageJson } from "#project/package/types/PackageJson";
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
    upgraded = writeJsonValue(
      upgraded,
      path,
      ["packageManager"],
      undefined,
      jsonIndentation,
    );
  }

  if (scripts?.["preinstall"] === onlyAllowScript) {
    upgraded = writeJsonValue(
      upgraded,
      path,
      ["scripts", "preinstall"],
      undefined,
      jsonIndentation,
    );
  }

  return upgraded;
}
