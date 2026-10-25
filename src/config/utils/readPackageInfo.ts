import { packageSchema } from "#config/config/schemas/packageSchema";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { validate } from "#support/validation/utils/validate";
import type { PackageInfo } from "#config/types/PackageInfo";
import type { File } from "#types/File";

export function readPackageInfo(packagePath: File): PackageInfo {
  return validate(packageSchema, readJsonFile(packagePath) ?? {}, packagePath);
}
