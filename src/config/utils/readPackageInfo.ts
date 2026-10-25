import { packageSchema } from "#config/config/schemas/packageSchema";
import { packageFile } from "#config/constants";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { resolve } from "#support/filesystem/utils/resolve";
import { validate } from "#support/validation/utils/validate";
import type { PackageInfo } from "#config/types/PackageInfo";
import type { Directory } from "#types/Directory";

export function readPackageInfo(root: Directory): PackageInfo {
  const path = resolve(root, packageFile);

  return validate(packageSchema, readJsonFile(path) ?? {}, path);
}
