import { createFilesystem } from "#foundation/filesystem/operations/createFilesystem";
import { createSections } from "#foundation/options/utils/createSections";
import { liveSections } from "#project/config/constants";
import { createProjectSections } from "#project/config/operations/createProjectSections";
import type { Filesystem } from "#foundation/filesystem/types/Filesystem";
import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createProjectConfig({
  root,
  raw,
  configFile,
  filesystem = createFilesystem(root),
}: {
  root: Directory;
  raw: RawConfig;
  configFile: File | undefined;
  filesystem?: Filesystem;
}): ProjectConfig {
  const registry: OptionContext<ProjectConfig> & {
    readonly sections: ProjectConfig;
  } = createSections<ProjectConfig>(
    createProjectSections({
      root,
      raw,
      configFile,
      filesystem,
      context: {
        get(section) {
          return registry.get(section);
        },
      },
    }),
    liveSections,
  );

  return registry.sections;
}
