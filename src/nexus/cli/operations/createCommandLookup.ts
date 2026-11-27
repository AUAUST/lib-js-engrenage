import { isArray, isFunction, isObject } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";
import { freeze, get } from "@auaust/toolkit/object";

import { loadLazy } from "#foundation/modules/index";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandEntry } from "#nexus/cli/types/CommandEntry";
import type { CommandLoader } from "#nexus/cli/types/CommandLoader";
import type { CommandMount } from "#nexus/cli/types/CommandMount";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";

type GroupSource =
  | {
      readonly kind: "declared";
      readonly entries: readonly CommandEntry[];
    }
  | {
      readonly kind: "loader";
      readonly load: CommandLoader;
      /**
       * Its 1-based position among the group's subcommands.
       */
      readonly position: number;
    };

interface LoadedEntries {
  readonly entries: readonly CommandEntry[];
  readonly shadowable: boolean;
}

interface ProvidedEntry {
  /**
   * The entry, or `undefined` for a name the program's own commands reserve.
   */
  readonly entry: CommandEntry | undefined;
  readonly name: string;
  readonly names: readonly string[];
  readonly label: string;
}

interface SubcommandListing {
  readonly commands: readonly CommandDeclaration[];
  /**
   * The error of each mount that failed to load.
   */
  readonly failures: readonly unknown[];
}

interface ProvidedNames {
  readonly shadowable: boolean;
  readonly entries: readonly ProvidedEntry[];
}

function readSources({
  subcommands,
}: ParsingCommandDeclaration): readonly GroupSource[] {
  const sources: GroupSource[] = [];

  let declared: CommandEntry[] | undefined;

  for (const [index, entry] of subcommands.entries()) {
    if (isFunction(entry)) {
      declared = undefined;

      sources.push({
        kind: "loader",
        load: entry,
        position: index + 1,
      });
    } else if (declared === undefined) {
      declared = [entry];
      sources.push({ kind: "declared", entries: declared });
    } else {
      declared.push(entry);
    }
  }

  return sources;
}

function isCommand(value: unknown): value is CommandDeclaration {
  return (
    isObject(value) &&
    "kind" in value &&
    (value.kind === "parsing" || value.kind === "forwarding")
  );
}

function isEntry(value: unknown): value is CommandEntry {
  return isCommand(value) || get(value, "kind") === "mount";
}

function isSource(value: unknown): value is { readonly kind: "source" } {
  return get(value, "kind") === "source";
}

// @debt configuration errors name a loader loading commands rather than mounts by its position among the group's subcommands, since an inline loader carries no name
function describeLoader(position: number): string {
  return `the loader at position ${position}`;
}

/**
 * Loads the entries a loader of the group at `path` provides.
 *
 * @throws {Error} When the loader fails, its error as the cause.
 * @throws {TypeError} When it loads neither a command, a list of commands
 * nor a command source.
 */
async function loadEntries(
  load: CommandLoader,
  position: number,
  path: CommandPath,
): Promise<LoadedEntries> {
  let loaded: unknown;

  try {
    loaded = await loadLazy<unknown>({ load });
  } catch (error) {
    throw new Error(
      `The loader at position ${position} of '${join(path, " ")}' failed to load`,
      {
        cause: error,
      },
    );
  }

  const source = isSource(loaded) && "commands" in loaded ? loaded : undefined;
  const listed = source === undefined ? loaded : source.commands;
  const entries: readonly unknown[] = isArray(listed) ? listed : [listed];

  if (!entries.every(isEntry)) {
    throw new TypeError(
      `The loader at position ${position} of '${join(path, " ")}' loads neither a command, a list of commands nor a command source`,
    );
  }

  return {
    entries,
    shadowable: (
      source !== undefined &&
      "shadowable" in source &&
      source.shadowable === true
    ),
  };
}

/**
 * Loads the declaration `mount`, a subcommand of the group at `path`, mounts
 * under its name and aliases.
 *
 * @throws {Error} When its loader fails, its error as the cause.
 * @throws {TypeError} When it loads no command.
 */
async function loadMount(
  mount: CommandMount,
  path: CommandPath,
): Promise<CommandDeclaration> {
  const described = `The '${mount.name}' command of '${join(path, " ")}'`;

  let loaded: unknown;

  try {
    loaded = await loadLazy<unknown>({ load: mount.load });
  } catch (error) {
    throw new Error(`${described} failed to load from ${mount.origin}`, {
      cause: error,
    });
  }

  if (!isCommand(loaded)) {
    throw new TypeError(`${described} loads no command from ${mount.origin}`);
  }

  return freeze({
    ...loaded,
    name: mount.name,
    aliases: mount.aliases,
  });
}

function names({ name, aliases }: Pick<CommandEntry, "name" | "aliases">) {
  return [name, ...aliases];
}

function provideEntries(
  { entries, shadowable }: LoadedEntries,
  label: string,
): ProvidedNames {
  return {
    shadowable,
    entries: entries.map((entry) => {
      return {
        entry,
        name: entry.name,
        names: names(entry),
        label: entry.kind === "mount" ? entry.origin : label,
      };
    }),
  };
}

/**
 * Checks that no two of `sources`, provided in order by the group at `path`,
 * provide one name, unless the later one is shadowable.
 *
 * @returns The entries each name leads to, earlier sources winning.
 * @throws {TypeError} When two sources provide one name, the later not shadowable,
 * or one source provides a name twice.
 */
function mergeSources(
  sources: readonly ProvidedNames[],
  path: CommandPath,
): readonly ProvidedEntry[] {
  const owners = new Map<
    string,
    { readonly source: ProvidedNames; readonly label: string }
  >();

  const merged: ProvidedEntry[] = [];
  const group = join(path, " ");

  for (const source of sources) {
    for (const provided of source.entries) {
      const taken = provided.names.filter((name) => {
        const owner = owners.get(name);

        if (owner?.source === source && owner.label === provided.label) {
          throw new TypeError(
            `The '${name}' command in '${group}' comes twice from ${provided.label}`,
          );
        }

        if (
          owner !== undefined &&
          (owner.source === source || !source.shadowable)
        ) {
          throw new TypeError(
            `The '${name}' command in '${group}' comes from both ${owner.label} and ${provided.label}`,
          );
        }

        return owner !== undefined;
      });

      if (taken.includes(provided.name)) {
        continue;
      }

      for (const name of provided.names) {
        if (!owners.has(name)) {
          owners.set(name, { source, label: provided.label });
        }
      }

      merged.push(provided);
    }
  }

  return merged;
}

/**
 * Creates a lookup of the subcommands groups provide, calling each loader and
 * loading each mount once, through `track` when given.
 *
 * @pure
 */
export function createCommandLookup(
  track: <Loaded>(load: () => Promise<Loaded>) => Promise<Loaded> = (load) => {
    return load();
  },
) {
  const loaded = new Map<CommandLoader, Promise<LoadedEntries>>();
  const mounted = new Map<CommandMount, Promise<CommandDeclaration>>();

  /** @effectful */
  function provide(
    source: GroupSource,
    path: CommandPath,
  ): Promise<LoadedEntries> {
    if (source.kind === "declared") {
      return Promise.resolve({ entries: source.entries, shadowable: false });
    }

    const pending = (
      loaded.get(source.load) ??
      track(() => {
        return loadEntries(source.load, source.position, path);
      })
    );

    loaded.set(source.load, pending);

    return pending;
  }

  /** @effectful */
  function declare(
    entry: CommandEntry,
    path: CommandPath,
  ): Promise<CommandDeclaration> {
    if (entry.kind !== "mount") {
      return Promise.resolve(entry);
    }

    const pending = (
      mounted.get(entry) ??
      track(() => {
        return loadMount(entry, path);
      })
    );

    mounted.set(entry, pending);

    return pending;
  }

  /**
   * The subcommand of `group`, at `path` from the program's name, that `name`
   * names, by its name or an alias, from the first of its subcommands and loaders
   * providing it, calling a loader only when every earlier one misses and loading
   * a mount only once it matches; a shadowable source's command whose name an
   * earlier one provides yields whole, its aliases included.
   *
   * @throws {Error} When a loader it calls or the mount it matches fails.
   * @effectful
   */
  async function find(
    group: ParsingCommandDeclaration,
    path: CommandPath,
    name: string,
  ): Promise<CommandDeclaration | undefined> {
    const earlier = new Set<string>();

    for (const source of readSources(group)) {
      const { entries, shadowable } = await provide(source, path);

      const kept = shadowable
        ? entries.filter((entry) => {
            return !earlier.has(entry.name);
          })
        : entries;

      const found = kept.find((entry) => {
        return names(entry).includes(name);
      });

      if (found !== undefined) {
        return declare(found, path);
      }

      for (const entry of kept) {
        for (const each of names(entry)) {
          earlier.add(each);
        }
      }
    }
  }

  /**
   * Every subcommand of `group`, at `path` from the program's name, calling
   * all its loaders and loading all its mounts: the name of each from the
   * first source providing it, after the `reserved` names of the program's own
   * commands, apart from the error of each mount failing to load, so one failing
   * mount hides no other subcommand.
   *
   * @throws {TypeError} When two sources provide one name, the later not
   * shadowable, or one source provides a name twice.
   * @throws {Error} When a loader fails.
   * @effectful
   */
  async function list(
    group: ParsingCommandDeclaration,
    path: CommandPath,
    reserved: readonly string[] = [],
  ): Promise<SubcommandListing> {
    const sources = readSources(group);

    const provided = await Promise.all(
      sources.map(async (source) => {
        return provideEntries(
          await provide(source, path),
          source.kind === "declared"
            ? "the declared commands"
            : describeLoader(source.position),
        );
      }),
    );

    const merged = mergeSources(
      [
        {
          shadowable: false,
          entries: reserved.map((name) => {
            return {
              entry: undefined,
              name,
              names: [name],
              label: "the program's own commands",
            };
          }),
        },
        ...provided,
      ],
      path,
    );

    const declared = await Promise.allSettled(
      merged.flatMap(({ entry }) => {
        return entry === undefined ? [] : [declare(entry, path)];
      }),
    );

    const commands: CommandDeclaration[] = [];
    const failures: unknown[] = [];

    for (const result of declared) {
      if (result.status === "fulfilled") {
        commands.push(result.value);
      } else {
        failures.push(result.reason);
      }
    }

    return { commands, failures };
  }

  return {
    find,
    list,
  };
}
