import { assign } from "@auaust/toolkit/object";

import { resolve } from "#foundation/filesystem/index";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { readRawConfig } from "#project/config/operations/readRawConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";

const loadedConfigs = new Map<Directory, Promise<LoadedConfig>>();
const pendingConfigs = new Map<Directory, Promise<LoadedConfig>>();
const roots = new Map<Directory, Directory>();

async function readConfig(
  start: Directory,
  searchParents: boolean,
): Promise<LoadedConfig> {
  const { root, configFile, raw } = await readRawConfig(start, {
    searchParents,
  });

  roots.set(start, root);

  const loaded = loadedConfigs.get(root);

  if (loaded !== undefined) {
    return loaded;
  }

  const created = createProjectConfig({
    root,
    raw,
    configFile,
  });

  loadedConfigs.set(root, Promise.resolve(created));

  return created;
}

function load(
  cwd: Directory | URL = process.cwd(),
  { searchParents = true }: { searchParents?: boolean } = {},
): Promise<LoadedConfig> {
  const start = resolve(cwd);
  const root = searchParents ? roots.get(start) : start;
  const loaded = root === undefined ? undefined : loadedConfigs.get(root);

  if (loaded !== undefined) {
    return loaded;
  }

  const pending = pendingConfigs.get(start);

  if (pending !== undefined) {
    return pending;
  }

  const read = readConfig(start, searchParents).finally(() => {
    pendingConfigs.delete(start);
  });

  pendingConfigs.set(start, read);

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
 * `package.json`, else `cwd`; with `searchParents: false`, `cwd` only. Warns when
 * no config file is found and rejects when the file exports no object. Sections
 * are validated only when resolved. Memoized per project root, concurrent loads
 * sharing one read; `refresh(root)` drops the root's entry so the next load reads
 * it again.
 *
 * @stable
 */
export const loadConfig = assign(load, {
  refresh,
});
