import { assign } from "@auaust/toolkit/object";

import { resolve } from "#foundation/filesystem/index";
import {
  createConsoleReporter,
  type Reporter,
} from "#foundation/reports/index";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { readRawConfig } from "#project/config/operations/readRawConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";

const defaultReporter = createConsoleReporter();

const loadedConfigs = new Map<
  Reporter,
  Map<Directory, Promise<LoadedConfig>>
>();

const pendingConfigs = new Map<
  Reporter,
  Map<Directory, Promise<LoadedConfig>>
>();

const roots = new Map<Directory, Directory>();

function entriesOf(
  caches: Map<Reporter, Map<Directory, Promise<LoadedConfig>>>,
  reporter: Reporter,
): Map<Directory, Promise<LoadedConfig>> {
  const existing = caches.get(reporter);

  if (existing !== undefined) {
    return existing;
  }

  const created = new Map<Directory, Promise<LoadedConfig>>();

  caches.set(reporter, created);

  return created;
}

async function readConfig(
  start: Directory,
  searchParents: boolean,
  reporter: Reporter,
): Promise<LoadedConfig> {
  const { root, configFile, raw } = await readRawConfig(start, {
    searchParents,
  });

  roots.set(start, root);

  const loaded = entriesOf(loadedConfigs, reporter);
  const cached = loaded.get(root);

  if (cached !== undefined) {
    return cached;
  }

  const created = createProjectConfig({
    root,
    raw,
    configFile,
    reporter,
  });

  loaded.set(root, Promise.resolve(created));

  return created;
}

function load(
  cwd: Directory | URL = process.cwd(),
  {
    searchParents = true,
    reporter = defaultReporter,
  }: { searchParents?: boolean; reporter?: Reporter } = {},
): Promise<LoadedConfig> {
  const start = resolve(cwd);
  const root = searchParents ? roots.get(start) : start;

  const loaded = root === undefined
    ? undefined
    : loadedConfigs.get(reporter)?.get(root);

  if (loaded !== undefined) {
    return loaded;
  }

  const pending = entriesOf(pendingConfigs, reporter);
  const reading = pending.get(start);

  if (reading !== undefined) {
    return reading;
  }

  const read = readConfig(start, searchParents, reporter).finally(() => {
    pending.delete(start);
  });

  pending.set(start, read);

  return read;
}

// @debt a read pending when `refresh` runs still caches the config it read before the refresh
function refresh(root: Directory): void {
  for (const loaded of loadedConfigs.values()) {
    loaded.delete(root);
  }

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
 * `package.json`, else `cwd`; with `searchParents: false`, `cwd` only. Warns when
 * no config file is found and rejects when the file exports no object. Sections
 * are validated only when resolved. The config reports through `reporter`, a
 * shared console reporter by default. Memoized per reporter and project root,
 * concurrent loads sharing one read; `refresh(root)` drops the root's entries
 * under every reporter so the next load reads it again.
 *
 * @stable
 */
export const loadConfig = assign(load, {
  refresh,
});
