import {
  includes,
  isNonEmptyArray,
  map,
  toSorted,
} from "@auaust/toolkit/array";
import { freeze, keys, values } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { collectExtensions } from "#foundation/extensions/index";
import {
  createFilesystem,
  createFilesystemView,
  resolveWithin,
  type Filesystem,
} from "#foundation/filesystem/index";
import { loadLazy } from "#foundation/modules/index";
import {
  createResolver,
  validate,
  type InputLayer,
  type KeyedSection,
} from "#foundation/options/index";
import {
  createConsoleReporter,
  type Reporter,
} from "#foundation/reports/index";
import { extensionsSchema } from "#project/config/config/schemas/extensionsSchema";
import { unpresettable } from "#project/config/constants";
import { checkCompatibility } from "#project/config/utils/checkCompatibility";
import { checkDirectiveNames } from "#project/config/utils/checkDirectiveNames";
import { checkFileParts } from "#project/config/utils/checkFileParts";
import { checkScopeInputs } from "#project/config/utils/checkScopeInputs";
import { describeRemovedKey } from "#project/config/utils/describeRemovedKey";
import { explainInactive } from "#project/config/utils/explainInactive";
import { flattenExtensions } from "#project/config/utils/flattenExtensions";
import { flattenInput } from "#project/config/utils/flattenInput";
import { isExtensionActive } from "#project/config/utils/isExtensionActive";
import { listInputScopes } from "#project/config/utils/listInputScopes";
import { readGlobLayers } from "#project/config/utils/readGlobLayers";
import type { MatchedWorkspace } from "#batiment/context/index";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { ConfigSections } from "#project/config/types/ConfigSections";
import type { ConfigSlots } from "#project/config/types/ConfigSlots";
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
  reporter = createConsoleReporter(),
}: {
  root: Directory;
  raw: RawConfig;
  configFile: File | undefined;
  filesystem?: Filesystem;
  reporter?: Reporter;
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

  const builtinExtensions = toSorted(values(builtins), (left, right) => {
    return left.name < right.name ? -1 : 1;
  });

  const registry = collectExtensions<Extension, ConfigResolver>(
    [...builtinExtensions, ...extensions],
    {
      slotKind: "slots",
      isActive: isExtensionActive,
      explainInactive,
      matches(read, produced): boolean {
        return produced === read || produced.startsWith(`${read}#`);
      },
    },
  );

  checkFileParts(registry);

  checkDirectiveNames(registry);

  async function refuse(
    key: string,
    reader: ConfigResolver,
  ): Promise<string | undefined> {
    const owner = registry.owner("keys", key);

    const requires = owner?.requires ?? [];

    if (
      owner === undefined ||
      (owner.when === undefined && !isNonEmptyArray(requires))
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
        section: await loadLazy(declaration),
      };
    }
  }

  const names = map(registry.extensions, ({ name }) => name);

  const presetLayers = new WeakMap<object, Promise<readonly InputLayer[]>>();

  async function loadPresetLayers({
    name,
    load: loadValues,
  }: ConfigSlots["presets"]): Promise<readonly InputLayer[]> {
    const loaded = (await loadValues?.()) ?? {};

    const reserved = keys(loaded).filter((path) => {
      return unpresettable.some((input) => {
        return path === input || path.startsWith(`${input}.`);
      });
    });

    if (isNonEmptyArray(reserved)) {
      throw new Error(
        `Preset "${name}" sets ${reserved.join(", ")}, which presets never set`,
      );
    }

    return [{ name: `preset "${name}"`, values: loaded }];
  }

  async function presetDefaults(
    input: string,
    reader: ConfigResolver,
  ): Promise<readonly InputLayer[]> {
    if (includes(unpresettable, input)) {
      return [];
    }

    const preset = await reader.resolve("preset");

    if (preset === false) {
      return [];
    }

    const pending = presetLayers.get(preset) ?? loadPresetLayers(preset);

    presetLayers.set(preset, pending);

    return pending;
  }

  const inputScopes = listInputScopes(registry);

  const children = new Map<Directory, Promise<LoadedConfig>>();

  const created = new Set<LoadedConfig>();

  function copy({
    reporter: copied = reporter,
  }: { reporter?: Reporter } = {}): LoadedConfig {
    return createProjectConfig({
      root,
      raw,
      configFile,
      reporter: copied,
    });
  }

  function createConfig({
    dir,
    view,
    input,
    origin: from,
    defaults,
    parent,
  }: {
    dir: Directory;
    view: Filesystem;
    input: RawConfig;
    origin: string;
    defaults(
      name: string,
      reader: ConfigResolver,
    ): Promise<readonly InputLayer[]>;
    parent?: ConfigResolver;
  }): LoadedConfig {
    const directory = resolveWithin(root, dir);

    const {
      resolve,
      input: readInput,
      origin,
      context,
      validate: validateKeys,
      forget,
    } = createResolver<ConfigContext, ConfigSections>(
      input,
      {
        root: directory,
        scopeDir: dir,
        filesystem: view,
        reporter,
        configFile,
        registry,
        path(...paths: string[]) {
          return resolveWithin(directory, ...paths);
        },
        // @debt a child resolver's `copy` returns a fresh root config, silently changing scope
        copy,
        workspace,
        scope,
      },
      {
        source: from,
        sections: {
          load,
          refuse,
        },
        defaults,
        unknownNote: `Registered extensions: ${names.join(", ")}`,
        describeUnknown: describeRemovedKey,
        reporter,
        ...(parent === undefined
          ? {}
          : {
              parent: {
                resolver: parent,
                delegates(key: string): boolean {
                  return registry.get("keys", key)?.scope === "project";
                },
              },
            }),
      },
    );

    return freeze({
      resolve,
      input: readInput,
      origin,
      context,
      validate: validateKeys,
      forget,
    });
  }

  const project = createConfig({
    dir: rootScope,
    view: filesystem,
    input: raw,
    origin: source,
    defaults: presetDefaults,
  });

  async function createWorkspaceConfig({
    dir,
    file,
    remainder,
    glob,
  }: MatchedWorkspace): Promise<LoadedConfig> {
    await project.resolve("workspaces.options");

    checkScopeInputs(inputScopes, remainder, file);

    const { configured, inherited } = glob === undefined
      ? { configured: undefined, inherited: [] }
      : readGlobLayers({
          raw,
          glob,
          defaults: await presetDefaults("workspaces", project),
          scopes: inputScopes,
          reporter,
        });

    const child = createConfig({
      dir,
      view: createFilesystemView(filesystem, root, dir),
      input: remainder,
      origin: file,
      parent: project,
      async defaults(name, reader): Promise<readonly InputLayer[]> {
        const scope = inputScopes.get(name);

        const shared = scope?.scope === "inherited"
          ? await project.input(scope.key)
          : undefined;

        return [
          ...(configured === undefined ? [] : [configured]),
          ...(await presetDefaults(name, reader)),
          ...inherited,
          ...(shared === undefined
            ? []
            : [
                {
                  name: "root config",
                  values: flattenInput(name, shared),
                },
              ]),
        ];
      },
    });

    created.add(child);

    return child;
  }

  function workspace(matched: MatchedWorkspace): Promise<LoadedConfig> {
    const known = children.get(matched.dir);

    if (known !== undefined) {
      return known;
    }

    const pending = createWorkspaceConfig(matched);

    children.set(matched.dir, pending);

    return pending;
  }

  async function scope(dir: Directory): Promise<LoadedConfig> {
    if (dir === rootScope) {
      return config;
    }

    const context = await project.resolve("structure.context");

    await context.discover();

    const known = children.get(dir);

    if (known === undefined) {
      throw new Error(`No workspace lies at ${dir}`);
    }

    return known;
  }

  const config: LoadedConfig = freeze({
    ...project,
    forget() {
      project.forget();

      for (const child of created) {
        child.forget();
      }
    },
  });

  return config;
}
