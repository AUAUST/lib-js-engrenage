import { constant } from "@auaust/toolkit/constant";
import { freeze, values } from "@auaust/toolkit/object";

import { collectExtensions } from "#foundation/extensions/index";
import {
  createFilesystem,
  resolveWithin,
  type Filesystem,
} from "#foundation/filesystem/index";
import { createResolver, validate } from "#foundation/options/index";
import { extensionsSchema } from "#project/config/config/schemas/extensionsSchema";
import type { Extension } from "#project/config/types/Extension";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

import * as builtins from "#workflows/builtins/entry";

export function createProjectConfig({
  root,
  raw,
  configFile,
  filesystem = createFilesystem(root),
}: {
  root: Directory;
  raw: RawConfig;
  configFile: File | undefined;
  filesystem?: Filesystem;
}): LoadedConfig {
  const source = configFile ?? root;

  const listed = extensionsSchema.resolve(
    validate(
      extensionsSchema.schema,
      raw.extensions,
      `extensions config in ${source}`,
    ),
    undefined,
    "extensions",
  );

  const registry = collectExtensions<Extension>(
    [...values(builtins).flat(), ...listed],
    {
      slotKind: "slots",
      isActive: constant(true),
    },
  );

  const {
    resolve,
    context,
    validate: validateSections,
  } = createResolver(
    raw,
    {
      root,
      filesystem,
      configFile,
      registry,
      path(...paths: string[]) {
        return resolveWithin(root, ...paths);
      },
    },
    {
      source,
    },
  );

  return freeze({
    resolve,
    context,
    validate: validateSections,
  });
}
