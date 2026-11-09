import { constant } from "@auaust/toolkit/constant";
import { freeze, values } from "@auaust/toolkit/object";

import { collectExtensions } from "#foundation/extensions/index";
import {
  createFilesystem,
  resolveWithin,
  type Filesystem,
} from "#foundation/filesystem/index";
import {
  createResolver,
  validate,
  type KeyedSection,
  type Section,
} from "#foundation/options/index";
import { extensionsSchema } from "#project/config/config/schemas/extensionsSchema";
import { findSectionKey } from "#project/config/operations/findSectionKey";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ConfigKey } from "#project/config/types/ConfigKey";
import type { ConfigSections } from "#project/config/types/ConfigSections";
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

  async function load(key: string): Promise<KeyedSection | undefined> {
    const declaration = registry.get("keys", key);

    if (declaration !== undefined) {
      return {
        input: declaration.input,
        section: await declaration.load(),
      };
    }
  }

  function keyOf(section: Section): Promise<ConfigKey | undefined> {
    return findSectionKey(registry, section);
  }

  const {
    resolve,
    context,
    validate: validateSections,
  } = createResolver<ConfigContext, ConfigSections>(
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
      sections: { load, keyOf },
    },
  );

  return freeze({
    resolve,
    context,
    validate: validateSections,
  });
}
