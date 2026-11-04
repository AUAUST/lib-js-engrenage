import { createFilesystem } from "#foundation/filesystem/operations/createFilesystem";
import { createProjectConfig } from "#project/config/operations/createProjectConfig";
import { readRawConfig } from "#project/config/operations/readRawConfig";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Directory } from "#types/Directory";

export async function readConfig(
  start: Directory,
  options: { searchParents?: boolean } = {},
): Promise<ProjectConfig> {
  const { root, configFile, raw } = await readRawConfig(start, options);

  return createProjectConfig({
    root,
    raw,
    configFile,
    filesystem: createFilesystem(root),
  });
}
