import { isArray, isFunction, isObject } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";
import { freeze, get } from "@auaust/toolkit/object";

import { loadLazy } from "#foundation/modules/index";
import { mergeCommandSources } from "#nexus/cli/utils/mergeCommandSources";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandEntry } from "#nexus/cli/types/CommandEntry";
import type { CommandLoader } from "#nexus/cli/types/CommandLoader";
import type { CommandMount } from "#nexus/cli/types/CommandMount";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";
import type { ProvidedSource } from "#nexus/cli/types/ProvidedSource";
import type { SubcommandMatch } from "#nexus/cli/types/SubcommandMatch";
import type { UnavailableCommand } from "#nexus/cli/types/UnavailableCommand";

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

interface SubcommandListing {
  readonly commands: readonly CommandDeclaration[];
  /**
   * Each mount its check reports unavailable, its declaration never loaded.
   */
  readonly unavailable: readonly UnavailableCommand[];
  /**
   * The error of each loader, check and mount that failed to load.
   */
  readonly failures: readonly unknown[];
}

type DeclaredEntry =
  | { readonly kind: "available"; readonly command: CommandDeclaration }
  | { readonly kind: "unavailable"; readonly command: UnavailableCommand };

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

function splitSettled<Value>(results: readonly PromiseSettledResult<Value>[]): {
  readonly values: readonly Value[];
  readonly failures: readonly unknown[];
} {
  const values: Value[] = [];
  const failures: unknown[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      values.push(result.value);
    } else {
      failures.push(result.reason);
    }
  }

  return { values, failures };
}

function names({ name, aliases }: Pick<CommandEntry, "name" | "aliases">) {
  return [name, ...aliases];
}

function provideEntries(
  { entries, shadowable }: LoadedEntries,
  label: string,
): ProvidedSource {
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
  const checked = new Map<CommandMount, Promise<string | undefined>>();
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

  /**
   * The reason `mount` is unavailable, or `undefined` when it is available.
   *
   * @throws {Error} When its check fails, its error as the cause.
   * @effectful
   */
  function check(
    mount: CommandMount,
    path: CommandPath,
  ): Promise<string | undefined> {
    const pending = (
      checked.get(mount) ??
      track(async () => {
        try {
          return await mount.check?.();
        } catch (error) {
          throw new Error(
            `The '${mount.name}' command of '${join(path, " ")}' failed to check its availability from ${mount.origin}`,
            { cause: error },
          );
        }
      })
    );

    checked.set(mount, pending);

    return pending;
  }

  /** @effectful */
  async function inspect(
    entry: CommandEntry,
    path: CommandPath,
  ): Promise<DeclaredEntry> {
    if (entry.kind !== "mount") {
      return { kind: "available", command: entry };
    }

    const reason = await check(entry, path);

    if (reason !== undefined) {
      return {
        kind: "unavailable",
        command: freeze({
          name: entry.name,
          aliases: entry.aliases,
          reason,
        }),
      };
    }

    const pending = (
      mounted.get(entry) ??
      track(() => {
        return loadMount(entry, path);
      })
    );

    mounted.set(entry, pending);

    return { kind: "available", command: await pending };
  }

  /**
   * @throws {Error} When `entry` is an unavailable mount, naming its reason;
   * when its check or its declaration fails to load.
   * @effectful
   */
  async function declare(
    entry: CommandEntry,
    path: CommandPath,
  ): Promise<CommandDeclaration> {
    const inspected = await inspect(entry, path);

    if (inspected.kind === "unavailable") {
      throw new Error(
        `The '${entry.name}' command of '${join(path, " ")}' is unavailable: ${inspected.command.reason}`,
      );
    }

    return inspected.command;
  }

  /**
   * The subcommand of `group`, at `path` from the program's name, that `name`
   * names, by its name or an alias, from the first of its subcommands and loaders
   * providing it, calling a loader only when every earlier one misses and loading
   * a mount only once it matches; a shadowable source's command whose name an
   * earlier one provides yields whole, its aliases included. A failing loader
   * leaves the name unresolved, never missing, since its source may provide it.
   *
   * @throws {Error} When a later source provides the name after a loader fails,
   * that loader's error; when the mount it matches is unavailable, naming
   * its reason, or fails.
   * @effectful
   */
  async function find(
    group: ParsingCommandDeclaration,
    path: CommandPath,
    name: string,
  ): Promise<SubcommandMatch> {
    const earlier = new Set<string>();

    let failure: { readonly error: unknown } | undefined;

    for (const source of readSources(group)) {
      let provided: LoadedEntries;

      try {
        provided = await provide(source, path);
      } catch (error) {
        failure ??= { error };

        continue;
      }

      const kept = provided.shadowable
        ? provided.entries.filter((entry) => {
            return !earlier.has(entry.name);
          })
        : provided.entries;

      const found = kept.find((entry) => {
        return names(entry).includes(name);
      });

      if (found !== undefined) {
        if (failure !== undefined) {
          throw failure.error;
        }

        return { kind: "found", command: await declare(found, path) };
      }

      for (const entry of kept) {
        for (const each of names(entry)) {
          earlier.add(each);
        }
      }
    }

    return { kind: failure === undefined ? "missing" : "unresolved" };
  }

  /**
   * Every subcommand of `group`, at `path` from the program's name, calling all
   * its loaders and loading all its available mounts: the name of each from the
   * first source providing it, after the `reserved` names of the program's own
   * commands, among the sources that load, apart from each mount its check reports
   * unavailable and from the error of each loader, check and mount failing to
   * load, so one failing source hides no other subcommand.
   *
   * @throws {TypeError} When two sources that load provide one name, the later
   * not shadowable, or one source provides a name twice.
   * @effectful
   */
  async function list(
    group: ParsingCommandDeclaration,
    path: CommandPath,
    reserved: readonly string[] = [],
  ): Promise<SubcommandListing> {
    const sources = readSources(group);

    const loaded = splitSettled(
      await Promise.allSettled(
        sources.map(async (source) => {
          return provideEntries(
            await provide(source, path),
            source.kind === "declared"
              ? "the declared commands"
              : describeLoader(source.position),
          );
        }),
      ),
    );

    const merged = mergeCommandSources(
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
        ...loaded.values,
      ],
      path,
    );

    const declared = splitSettled(
      await Promise.allSettled(
        merged.flatMap(({ entry }) => {
          return entry === undefined ? [] : [inspect(entry, path)];
        }),
      ),
    );

    const commands: CommandDeclaration[] = [];
    const unavailable: UnavailableCommand[] = [];

    for (const each of declared.values) {
      if (each.kind === "available") {
        commands.push(each.command);
      } else {
        unavailable.push(each.command);
      }
    }

    return {
      commands,
      unavailable,
      failures: [...loaded.failures, ...declared.failures],
    };
  }

  return {
    find,
    list,
  };
}
