import { createFilesystem } from "#foundation/filesystem/index";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { readRawConfig } from "#project/config/operations/readRawConfig";
import type { LoadedConfig } from "#project/config/types/LoadedConfig";
import type { Directory } from "#types/Directory";

// @debt duplicates `workflows/registry` readConfig and loadConfig with a second cache and no schema validation, so tool definers read an unvalidated partial config and a process may load the file twice
export async function readConfig(
  start: Directory,
  options: { searchParents?: boolean } = {},
): Promise<LoadedConfig> {
  const { root, configFile, raw } = await readRawConfig(start, options);

  return createProjectConfig({
    root,
    raw,
    configFile,
    filesystem: createFilesystem(root),
  });
}
