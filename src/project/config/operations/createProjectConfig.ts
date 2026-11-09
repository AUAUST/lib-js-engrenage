import { map } from "@auaust/primitive-kit/arrays";
import { freeze, values } from "@auaust/toolkit/object";

import { collectExtensions, type Registry } from "#foundation/extensions/index";
import {
  createFilesystem,
  resolveWithin,
  type Filesystem,
} from "#foundation/filesystem/index";
import {
  createResolver,
  validate,
  type KeyedSection,
} from "#foundation/options/index";
import { extensionsSchema } from "#project/config/config/schemas/extensionsSchema";
import { checkFileParts } from "#project/config/utils/checkFileParts";
import type { ConfigContext } from "#project/config/types/ConfigContext";
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

  // @debt the registry's activation reads the resolver built from that same registry, a circular dependency that forces explicit annotations
  const registry: Registry<Extension> = collectExtensions<Extension>(
    [...values(builtins).flat(), ...listed],
    {
      slotKind: "slots",
      async isActive({ when }): Promise<boolean> {
        if (when === undefined) {
          return true;
        }

        const environment = await resolve("environment");

        return environment.hasDependency(when.installed);
      },
      explainInactive,
    },
  );

  checkFileParts(registry);

  function explainInactive({ when }: Extension): string | undefined {
    return when === undefined ? undefined : `install ${when.installed}`;
  }

  async function refuse(key: string): Promise<string | undefined> {
    const owner = registry.owner("keys", key);

    if (owner?.when === undefined || (await registry.isActive(owner.name))) {
      return;
    }

    const explanation = explainInactive(owner);
    const refusal = `Config key "${key}" belongs to ${owner.name}, which is inactive`;

    return explanation === undefined ? refusal : `${refusal}: ${explanation}`;
  }

  async function load(key: string): Promise<KeyedSection | undefined> {
    const declaration = registry.get("keys", key);

    if (declaration !== undefined) {
      return {
        input: declaration.input,
        section: await declaration.load(),
      };
    }
  }

  const names = map(registry.extensions, ({ name }) => name);

  const {
    resolve,
    context,
    validate: validateKeys,
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
      sections: {
        load,
        refuse,
      },
      unknownNote: `Registered extensions: ${names.join(", ")}`,
    },
  );

  return freeze({
    resolve,
    context,
    validate: validateKeys,
  });
}
