import {
  looseObject,
  optional,
  picklist,
  record,
  string,
  union,
  unknown,
} from "valibot";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { createAccessors } from "#config/utils/createAccessors";
import { packageJsonFile, packageTypes, publishAccess } from "#constants";
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
      ? `No ${packageJsonFile} found in ${root}`
      : `${path} does not declare "${field}"`;
  }

  return createAccessors({
    resolvers: {
      manifest,
      name() {
        return validate(optional(string()), manifest()?.name, `${path} name`);
      },
      type() {
        return validate(
          optional(picklist(packageTypes)),
          manifest()?.type,
          `${path} type`,
        );
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
      bin() {
        return validate(
          optional(union([string(), record(string(), string())])),
          manifest()?.bin,
          `${path} bin`,
        );
      },
      repository() {
        return validate(
          optional(
            union([
              string(),
              looseObject({
                url: string(),
              }),
            ]),
          ),
          manifest()?.repository,
          `${path} repository`,
        );
      },
      publishConfig() {
        return validate(
          optional(
            looseObject({
              access: optional(picklist(publishAccess)),
            }),
          ),
          manifest()?.publishConfig,
          `${path} publishConfig`,
        );
      },
    },
    describeMissing,
  });
}
