import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";
import { optional, record, string, unknown } from "valibot";

import { createAccessors } from "#config/utils/createAccessors";
import { readJsonFile } from "#support/filesystem/utils/readJsonFile";
import { validate } from "#utils/validate";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const dependencyFields = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
] as const;

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
      dependencies() {
        const fields = manifest();

        if (fields === undefined) {
          return undefined;
        }

        return flatMap(dependencyFields, (field) => {
          const versions = validate(
            optional(record(string(), string()), {}),
            fields[field],
            `${path} ${field}`,
          );

          return keys(versions);
        });
      },
    },
    describeMissing,
  });
}
