import { isArray, isFunction, isObject } from "@auaust/toolkit";
import { join } from "@auaust/toolkit/array";

import { loadLazy } from "#foundation/modules/index";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandLoader } from "#nexus/cli/types/CommandLoader";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ParsingCommandDeclaration } from "#nexus/cli/types/ParsingCommandDeclaration";

type GroupSource =
  | {
      readonly kind: "declared";
      readonly commands: readonly CommandDeclaration[];
    }
  | {
      readonly kind: "loader";
      readonly load: CommandLoader;
      /**
       * Its 1-based position among the group's subcommands.
       */
      readonly position: number;
    };

interface LoadedCommands {
  readonly commands: readonly CommandDeclaration[];
  readonly shadowable: boolean;
}

interface ProvidedNames {
  readonly label: string;
  readonly shadowable: boolean;
  readonly commands: readonly Pick<CommandDeclaration, "name" | "aliases">[];
}

function readSources({
  subcommands,
}: ParsingCommandDeclaration): readonly GroupSource[] {
  const sources: GroupSource[] = [];

  let declared: CommandDeclaration[] | undefined;

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
      sources.push({ kind: "declared", commands: declared });
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

function isSource(value: unknown): value is { readonly kind: "source" } {
  return isObject(value) && "kind" in value && value.kind === "source";
}

// @debt configuration errors name a loader by its position among the group's subcommands, since an inline loader carries no name
function describeLoader(position: number): string {
  return `the loader at position ${position}`;
}

/**
 * Loads the commands a loader of the group at `path` provides.
 *
 * @throws {Error} When the loader fails, its error as the cause.
 * @throws {TypeError} When it loads neither a command, a list of commands
 * nor a command source.
 */
async function loadCommands(
  load: CommandLoader,
  position: number,
  path: CommandPath,
): Promise<LoadedCommands> {
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
  const commands: readonly unknown[] = isArray(listed) ? listed : [listed];

  if (!commands.every(isCommand)) {
    throw new TypeError(
      `The loader at position ${position} of '${join(path, " ")}' loads neither a command, a list of commands nor a command source`,
    );
  }

  return {
    commands,
    shadowable: (
      source !== undefined &&
      "shadowable" in source &&
      source.shadowable === true
    ),
  };
}

function names({
  name,
  aliases,
}: Pick<CommandDeclaration, "name" | "aliases">) {
  return [name, ...aliases];
}

/**
 * Checks that no two of `sources`, provided in order by the group at `path`,
 * provide one name, unless the later one is shadowable.
 *
 * @returns The commands each name leads to, earlier sources winning.
 * @throws {TypeError} When two sources provide one name, the later not shadowable,
 * or one source provides a name twice.
 */
function mergeSources(
  sources: readonly ProvidedNames[],
  path: CommandPath,
): readonly Pick<CommandDeclaration, "name" | "aliases">[] {
  const owners = new Map<string, ProvidedNames>();
  const merged: Pick<CommandDeclaration, "name" | "aliases">[] = [];
  const group = join(path, " ");

  for (const source of sources) {
    for (const command of source.commands) {
      const taken = names(command).filter((name) => {
        const owner = owners.get(name);

        if (owner === source) {
          throw new TypeError(
            `The '${name}' command in '${group}' comes twice from ${source.label}`,
          );
        }

        if (owner !== undefined && !source.shadowable) {
          throw new TypeError(
            `The '${name}' command in '${group}' comes from both ${owner.label} and ${source.label}`,
          );
        }

        return owner !== undefined;
      });

      for (const name of names(command)) {
        if (!owners.has(name)) {
          owners.set(name, source);
        }
      }

      if (!taken.includes(command.name)) {
        merged.push(command);
      }
    }
  }

  return merged;
}

/**
 * Creates a lookup of the subcommands groups provide, calling each loader once,
 * through `track` when given.
 *
 * @pure
 */
export function createCommandLookup(
  track: <Loaded>(load: () => Promise<Loaded>) => Promise<Loaded> = (load) => {
    return load();
  },
) {
  const loaded = new Map<CommandLoader, Promise<LoadedCommands>>();

  /** @effectful */
  function provide(
    source: GroupSource,
    path: CommandPath,
  ): Promise<LoadedCommands> {
    if (source.kind === "declared") {
      return Promise.resolve({ commands: source.commands, shadowable: false });
    }

    const pending = (
      loaded.get(source.load) ??
      track(() => {
        return loadCommands(source.load, source.position, path);
      })
    );

    loaded.set(source.load, pending);

    return pending;
  }

  /**
   * The subcommand of `group`, at `path` from the program's name, that `name`
   * names, by its name or an alias, from the first of its subcommands and loaders
   * providing it, calling a loader only when every earlier one misses.
   *
   * @throws {Error} When a loader it calls fails.
   * @effectful
   */
  async function find(
    group: ParsingCommandDeclaration,
    path: CommandPath,
    name: string,
  ): Promise<CommandDeclaration | undefined> {
    for (const source of readSources(group)) {
      const { commands } = await provide(source, path);

      const found = commands.find((command) => {
        return names(command).includes(name);
      });

      if (found !== undefined) {
        return found;
      }
    }
  }

  /**
   * Every subcommand of `group`, at `path` from the program's name, calling all
   * its loaders: the name of each from the first source providing it, after the
   * `reserved` names of the program's own commands.
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
  ): Promise<readonly CommandDeclaration[]> {
    const sources = readSources(group);

    const provided = await Promise.all(
      sources.map((source) => {
        return provide(source, path);
      }),
    );

    const merged = mergeSources(
      [
        {
          label: "the program's own commands",
          shadowable: false,
          commands: reserved.map((name) => {
            return { name, aliases: [] };
          }),
        },
        ...sources.map((source, index): ProvidedNames => {
          return {
            label: source.kind === "declared"
              ? "the declared commands"
              : describeLoader(source.position),
            shadowable: provided[index]?.shadowable ?? false,
            commands: provided[index]?.commands ?? [],
          };
        }),
      ],
      path,
    );

    return provided
      .flatMap(({ commands }) => {
        return commands;
      })
      .filter((command) => {
        return merged.includes(command);
      });
  }

  return {
    find,
    list,
  };
}
