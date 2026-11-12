import satisfies from "semver/functions/satisfies.js";
import validRange from "semver/ranges/valid.js";

import {
  flatMap,
  includes,
  isNotEmpty,
  map,
} from "@auaust/primitive-kit/arrays";
import { isArray } from "@auaust/toolkit/isArray";
import { freeze, keys, values } from "@auaust/toolkit/object";

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
} from "#foundation/options/index";
import { extensionsSchema } from "#project/config/config/schemas/extensionsSchema";
import { unpresettable } from "#project/config/constants";
import { checkFileParts } from "#project/config/utils/checkFileParts";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { ConfigSections } from "#project/config/types/ConfigSections";
import type { ConfigSlots } from "#project/config/types/ConfigSlots";
import type { Extension } from "#project/config/types/Extension";
import type { ExtensionOption } from "#project/config/types/ExtensionOption";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

import * as builtins from "#workflows/builtins/entry";

import manifest from "#package.json" with { type: "json" };

// @debt toolkit's `isArray` narrows to `any[]`, which a readonly list is not assignable to, so a local guard restates it
function isExtensionList(
  option: ExtensionOption,
): option is readonly ExtensionOption[] {
  return isArray(option);
}

function checkCompatibility(extensions: readonly Extension[]): void {
  const findings = flatMap(extensions, ({ name, compatibility }) => {
    if (compatibility === undefined) {
      return [];
    }

    const range = compatibility.engrenage;

    if (validRange(range) === null) {
      return [`${name} declares the invalid engrenage range "${range}"`];
    }

    return satisfies(manifest.version, range, {
      includePrerelease: true,
    })
      ? []
      : [
          `${name} requires engrenage ${range}, but ${manifest.version} is installed`,
        ];
  });

  if (isNotEmpty(findings)) {
    throw new Error(`Incompatible extensions:\n${findings.join("\n")}`);
  }
}

function flattenExtensions(
  options: readonly ExtensionOption[],
): readonly Extension[] {
  return flatMap(options, (option) => {
    return isExtensionList(option) ? flattenExtensions(option) : [option];
  });
}

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

  const extensions = flattenExtensions(listed);

  checkCompatibility(extensions);

  const registry = collectExtensions<Extension, ConfigResolver>(
    [...values(builtins), ...extensions],
    {
      slotKind: "slots",
      async isActive({ when }, config): Promise<boolean> {
        if (when === undefined) {
          return true;
        }

        const environment = await config.resolve("environment");

        return environment.hasDependency(when.installed);
      },
      explainInactive,
      matches(read, produced): boolean {
        return produced === read || produced.startsWith(`${read}#`);
      },
    },
  );

  checkFileParts(registry);

  function explainInactive({ when }: Extension): string | undefined {
    return when === undefined ? undefined : `install ${when.installed}`;
  }

  async function refuse(
    key: string,
    reader: ConfigResolver,
  ): Promise<string | undefined> {
    const owner = registry.owner("keys", key);

    const requires = owner?.requires ?? [];

    if (
      owner === undefined ||
      (owner.when === undefined && !isNotEmpty(requires))
    ) {
      return;
    }

    try {
      if (await registry.isActive(owner.name, reader)) {
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return `Config key "${key}" belongs to ${owner.name}, whose requirements are unmet: ${message}`;
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

  const presetValues = new WeakMap<
    object,
    Promise<Readonly<Record<string, unknown>>>
  >();

  async function loadPresetValues({
    name,
    load: loadValues,
  }: ConfigSlots["presets"]): Promise<Readonly<Record<string, unknown>>> {
    const loaded = (await loadValues?.()) ?? {};

    const reserved = keys(loaded).filter((path) => {
      return unpresettable.some((input) => {
        return path === input || path.startsWith(`${input}.`);
      });
    });

    if (isNotEmpty(reserved)) {
      throw new Error(
        `Preset "${name}" sets ${reserved.join(", ")}, which presets never set`,
      );
    }

    return loaded;
  }

  async function defaults(
    input: string,
    reader: ConfigResolver,
  ): Promise<Readonly<Record<string, unknown>>> {
    if (includes(unpresettable, input)) {
      return {};
    }

    const preset = await reader.resolve("preset");

    if (preset === false) {
      return {};
    }

    const pending = presetValues.get(preset) ?? loadPresetValues(preset);

    presetValues.set(preset, pending);

    return pending;
  }

  const {
    resolve,
    input: readInput,
    context,
    validate: validateKeys,
    forget,
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
      copy() {
        return createProjectConfig({
          root,
          raw,
          configFile,
        });
      },
    },
    {
      source,
      sections: {
        load,
        refuse,
      },
      defaults,
      unknownNote: `Registered extensions: ${names.join(", ")}`,
    },
  );

  return freeze({
    resolve,
    input: readInput,
    context,
    validate: validateKeys,
    forget,
  });
}
