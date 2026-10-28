import {
  array,
  boolean,
  looseObject,
  optional,
  picklist,
  record,
  string,
  union,
  unknown,
  type GenericSchema,
} from "valibot";

import { flatMap } from "@auaust/primitive-kit/arrays";
import { keys } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { createAccessors } from "#config/utils/createAccessors";
import { packageJsonFile, packageTypes, publishAccess } from "#constants";
import { parseJson } from "#support/json/utils/parseJson";
import { dependencyFields } from "#support/packageJson/constants";
import { validate } from "#utils/validate";
import type { PackageJson } from "#support/packageJson/types/PackageJson";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const personSchema = union([
  string(),
  looseObject({
    name: string(),
    email: optional(string()),
    url: optional(string()),
  }),
]);

export function createPackageJson({
  root,
  path,
  content,
}: {
  root: Directory;
  path: File | undefined;
  content: string | undefined;
}): PackageJson {
  const manifest = once(() => {
    return path === undefined || content === undefined
      ? undefined
      : validate(record(string(), unknown()), parseJson(content, path), path);
  });

  function describeMissing(field: string): string {
    return path === undefined
      ? `No ${packageJsonFile} found in ${root}`
      : `${path} does not declare "${field}"`;
  }

  function read<Output>(
    field: string,
    schema: GenericSchema<unknown, Output>,
  ): Output | undefined {
    return validate(optional(schema), manifest()?.[field], `${path} ${field}`);
  }

  return createAccessors({
    resolvers: {
      manifest,
      name() {
        return read("name", string());
      },
      version() {
        return read("version", string());
      },
      private() {
        return read("private", boolean());
      },
      description() {
        return read("description", string());
      },
      keywords() {
        return read("keywords", array(string()));
      },
      homepage() {
        return read("homepage", string());
      },
      bugs() {
        return read(
          "bugs",
          union([
            string(),
            looseObject({
              url: optional(string()),
              email: optional(string()),
            }),
          ]),
        );
      },
      repository() {
        return read(
          "repository",
          union([
            string(),
            looseObject({
              url: string(),
            }),
          ]),
        );
      },
      license() {
        return read("license", string());
      },
      author() {
        return read("author", personSchema);
      },
      contributors() {
        return read("contributors", array(personSchema));
      },
      type() {
        return read("type", picklist(packageTypes));
      },
      bin() {
        return read("bin", union([string(), record(string(), string())]));
      },
      scripts() {
        return read("scripts", record(string(), string()));
      },
      imports() {
        return read("imports", record(string(), unknown()));
      },
      main() {
        return read("main", string());
      },
      module() {
        return read("module", string());
      },
      types() {
        return read("types", string());
      },
      files() {
        return read("files", array(string()));
      },
      workspaces() {
        return read("workspaces", array(string()));
      },
      dependencies() {
        const fields = manifest();

        if (fields === undefined) {
          return;
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
      sideEffects() {
        return read("sideEffects", union([boolean(), array(string())]));
      },
      packageManager() {
        return read("packageManager", string());
      },
      engines() {
        return read("engines", record(string(), string()));
      },
      publishConfig() {
        return read(
          "publishConfig",
          looseObject({
            access: optional(picklist(publishAccess)),
          }),
        );
      },
    },
    describeMissing,
  });
}
