import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { isFunction } from "@auaust/toolkit";
import { get } from "@auaust/toolkit/object";
import type { MaybePromise } from "@auaust/toolkit/types";

import { isMissingError, pathExists } from "#foundation/filesystem/index";
import { commandMount } from "#nexus/cli/operations/commandMount";
import { commandSource } from "#nexus/cli/operations/commandSource";
import { forwardingCommand } from "#nexus/cli/operations/forwardingCommand";
import { getRunContext } from "#nexus/cli/operations/getRunContext";
import type { CommandDeclaration } from "#nexus/cli/types/CommandDeclaration";
import type { CommandLoader } from "#nexus/cli/types/CommandLoader";
import type { CommandMount } from "#nexus/cli/types/CommandMount";
import type { ProgramDeclaration } from "#nexus/cli/types/ProgramDeclaration";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function isProgram(value: unknown): value is ProgramDeclaration {
  return get(value, "kind") === "program";
}

async function listNames(directory: Directory): Promise<readonly string[]> {
  try {
    const names = await readdir(directory);

    return names.toSorted();
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }
}

/**
 * The root of the program `file` default-exports.
 *
 * @throws {TypeError} When its default export is no program.
 */
async function loadProgramRoot(file: File): Promise<CommandDeclaration> {
  const loaded: unknown = await import(pathToFileURL(file).href);

  const declared = get(loaded, "default");

  if (!isProgram(declared)) {
    throw new TypeError(`${file} default-exports no program`);
  }

  return declared.root;
}

function forwardExecutable(name: string, file: File): CommandDeclaration {
  return forwardingCommand({
    name,
    async action() {
      const { runNodeFile } = await import("#foundation/processes/index");

      return async (args: string[]) => {
        process.exitCode = await runNodeFile(file, args, {
          signal: getRunContext().signal,
        });
      };
    },
  });
}

async function mountDirectory(
  directory: Directory,
  name: string,
  { entry, executable }: { entry: File; executable: File },
): Promise<CommandMount | undefined> {
  const entryFile = join(directory, name, entry);
  const executableFile = join(directory, name, executable);

  const [
    hasEntry,
    hasExecutable,
  ] = await Promise.all([pathExists(entryFile), pathExists(executableFile)]);

  if (hasEntry) {
    return commandMount({
      name,
      origin: entryFile,
      load() {
        return loadProgramRoot(entryFile);
      },
    });
  }

  if (hasExecutable) {
    return commandMount({
      name,
      origin: executableFile,
      load() {
        return Promise.resolve(forwardExecutable(name, executableFile));
      },
    });
  }
}

/**
 * Declares a loader of the commands the subdirectories of `directories` hold,
 * relative to the working directory, listed when it loads, each named after its
 * subdirectory, two directories holding one name failing as a configuration error
 * where every subcommand of its group loads: one holding `entry` mounts the root
 * of the program the module default-exports, loaded only on a match or where
 * every subcommand of its group loads, to run in the current run; one holding
 * only `executable` runs that module in a Node process of its own, passing it
 * every argument after its name as a package script would, its exit code the
 * run's. A missing directory holds no command; with `shadowable`, a name an
 * earlier subcommand or loader provides yields to it.
 *
 * @pure
 */
export function directorySource({
  directories,
  entry,
  executable,
  shadowable = false,
}: {
  directories: Directories | (() => MaybePromise<Directories>);
  entry: File;
  executable: File;
  shadowable?: boolean;
}): CommandLoader {
  return async () => {
    const listed = isFunction(directories) ? await directories() : directories;

    const mounts = await Promise.all(
      listed.map(async (directory) => {
        const names = await listNames(directory);

        return Promise.all(
          names.map((name) => {
            return mountDirectory(directory, name, { entry, executable });
          }),
        );
      }),
    );

    return commandSource({
      commands: mounts.flat().filter((mount) => {
        return mount !== undefined;
      }),
      shadowable,
    });
  };
}
