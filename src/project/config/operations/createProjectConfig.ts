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
import { flattenExtensions } from "#project/config/utils/flattenExtensions";
import { flattenInput } from "#project/config/utils/flattenInput";
import { listInputScopes } from "#project/config/utils/listInputScopes";
import { readConfigPath } from "#project/config/utils/readConfigPath";
import { readGlobLayers } from "#project/config/utils/readGlobLayers";
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
      async isActive({ when }, config): Promise<boolean> {
        if (when === undefined) {
          return true;
        }

        if ("config" in when) {
          return (await readConfigPath(config, when.config)) === true;
        }

        const dependencies = await config.resolve("dependencies");

        return dependencies.hasDependency(when.installed);
      },
      explainInactive,
      matches(read, produced): boolean {
        return produced === read || produced.startsWith(`${read}#`);
      },
    },
  );

  checkFileParts(registry);

  checkDirectiveNames(registry);

  function explainInactive({ when }: Extension): string | undefined {
    if (when !== undefined) {
      return "config" in when
        ? `set ${when.config} to true`
        : `install ${when.installed}`;
    }
  }

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
    directory,
    view,
    input,
    origin: from,
    defaults,
    parent,
  }: {
    directory: Directory;
    view: Filesystem;
    input: RawConfig;
    origin: string;
    defaults(
      name: string,
      reader: ConfigResolver,
    ): Promise<readonly InputLayer[]>;
    parent?: ConfigResolver;
  }): LoadedConfig {
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
        filesystem: view,
        reporter,
        configFile,
        registry,
        path(...paths: string[]) {
          return resolveWithin(directory, ...paths);
        },
        // @debt a child resolver's `copy` returns a fresh root config, silently changing scope
        copy,
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
    directory: root,
    view: filesystem,
    input: raw,
    origin: source,
    defaults: presetDefaults,
  });

  async function createWorkspaceConfig(dir: Directory): Promise<LoadedConfig> {
    await project.resolve("workspaces.options");

    const [{ workspaces }, context] = await Promise.all([
      project.resolve("scopes.discovery"),
      project.resolve("structure.context"),
    ]);

    const workspace = workspaces.find((discovered) => discovered.dir === dir);

    if (workspace === undefined) {
      throw new Error(`No workspace lies at ${dir}`);
    }

    checkScopeInputs(inputScopes, workspace.remainder, workspace.file);

    const { expected } = await context.discover();

    const glob = expected.find(({ dirs }) => dirs.includes(dir))?.glob;

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
      directory: resolveWithin(root, dir),
      view: createFilesystemView(filesystem, root, dir),
      input: workspace.remainder,
      origin: workspace.file,
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

  function scope(dir: Directory): Promise<LoadedConfig> {
    if (dir === rootScope) {
      return Promise.resolve(config);
    }

    const known = children.get(dir);

    if (known !== undefined) {
      return known;
    }

    const pending = createWorkspaceConfig(dir);

    children.set(dir, pending);

    pending.catch(() => {
      if (children.get(dir) === pending) {
        children.delete(dir);
      }
    });

    return pending;
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
