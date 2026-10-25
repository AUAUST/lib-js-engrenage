import { once } from "@auaust/toolkit/once";
import { optional, record, string, unknown } from "valibot";

import { createAccessors } from "#support/accessors/builders/createAccessors";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { validate } from "#support/validation/utils/validate";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createPackageJson({
  root,
  path,
}: {
  root: Directory;
  path: File | undefined;
}): PackageJson {
  const manifest = once(() => {
    return path === undefined
      ? undefined
      : validate(record(string(), unknown()), readJsonFile(path), path);
  });

  function describeMissing(field: string): string {
    return path === undefined
      ? `No package.json found in ${root}`
      : `${path} does not declare "${field}"`;
  }

  return createAccessors({
    resolvers: {
      path: () => path,
      manifest,
      name() {
        return validate(optional(string()), manifest()?.name, `${path} name`);
      },
      imports() {
        return validate(
          optional(record(string(), unknown())),
          manifest()?.imports,
          `${path} imports`,
        );
      },
    },
    describeMissing,
  });
}
