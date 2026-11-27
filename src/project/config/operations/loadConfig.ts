import { assign } from "@auaust/toolkit/object";

import { resolve } from "#foundation/filesystem/index";
// @debt reads the run context through the whole `nexus/cli` surface, loading Commander into every config load outside a run
import { findRunContext } from "#nexus/cli/index";
import { createConsoleReporter, type Reporter } from "#nexus/reports/index";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { readRawConfig } from "#project/config/operations/readRawConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";

const defaultReporter = createConsoleReporter();

const loadedConfigs = new Map<
  Directory,
  WeakMap<Reporter, Promise<LoadedConfig>>
>();

// @debt `pendingConfigs` and `roots` keep an entry per directory ever loaded for the process's lifetime, the pending one an empty `WeakMap` once its reads settle
const pendingConfigs = new Map<
  Directory,
  WeakMap<Reporter, Promise<LoadedConfig>>
>();

const roots = new Map<Directory, Directory>();

function entriesOf(
  cache: Map<Directory, WeakMap<Reporter, Promise<LoadedConfig>>>,
  directory: Directory,
): WeakMap<Reporter, Promise<LoadedConfig>> {
  const existing = cache.get(directory);

  if (existing !== undefined) {
    return existing;
  }

  const created = new WeakMap<Reporter, Promise<LoadedConfig>>();

  cache.set(directory, created);

  return created;
}

async function readConfig(
  start: Directory,
  searchParents: boolean,
  reporter: Reporter,
): Promise<LoadedConfig> {
  const { root, configFile, raw } = await readRawConfig(start, {
    searchParents,
    reporter,
  });

  roots.set(start, root);

  const loaded = entriesOf(loadedConfigs, root);
  const cached = loaded.get(reporter);

  if (cached !== undefined) {
    return cached;
  }

  const created = createProjectConfig({
    root,
    raw,
    configFile,
    reporter,
  });

  loaded.set(reporter, Promise.resolve(created));

  return created;
}

function load(
  cwd: Directory | URL = process.cwd(),
  {
    searchParents = true,
    reporter = findRunContext()?.reporter ?? defaultReporter,
  }: { searchParents?: boolean; reporter?: Reporter } = {},
): Promise<LoadedConfig> {
  const start = resolve(cwd);
  const root = searchParents ? roots.get(start) : start;

  const loaded = root === undefined
    ? undefined
    : loadedConfigs.get(root)?.get(reporter);

  if (loaded !== undefined) {
    return loaded;
  }

  const pending = entriesOf(pendingConfigs, start);
  const reading = pending.get(reporter);

  if (reading !== undefined) {
    return reading;
  }

  const read = readConfig(start, searchParents, reporter).finally(() => {
    pending.delete(reporter);
  });

  pending.set(reporter, read);

  return read;
}

// @debt a read pending when `refresh` runs still caches the config it read before the refresh
function refresh(root: Directory): void {
  loadedConfigs.delete(root);

  for (const [start, found] of roots) {
    if (found === root) {
      roots.delete(start);
    }
  }
}

// @debt `refresh` rides on `loadConfig` because an operations module exports one name and both need the cache; a role for module-level state would let it stand alone
/**
 * Loads the config of the project holding `cwd`, the process's by default:
 * the nearest directory from `cwd` upwards with an engrenage config file or a
 * `package.json`, else `cwd`; with `searchParents: false`, `cwd` only. Warns
 * once per root and reporter when no config file is found and rejects when the
 * file exports no object. Sections are validated only when resolved. The config
 * reports through `reporter`, by default the reporter of the program run it loads
 * within, else a shared console reporter. Memoized per reporter and project root,
 * concurrent loads sharing one read; `refresh(root)` drops the root's entries
 * under every reporter so the next load reads it again.
 *
 * @stable
 */
export const loadConfig = assign(load, {
  refresh,
});
