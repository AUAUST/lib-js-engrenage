import {
  createFilesystem,
  type Filesystem,
} from "#foundation/filesystem/index";
import { createSections } from "#foundation/options/index";
import { liveSections } from "#project/config/constants";
import { createProjectSections } from "#project/config/operations/createProjectSections";
import type { ConfigContext } from "#project/config/types/ConfigContext";
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
}): ConfigContext {
  const context: ConfigContext = createSections(
    createProjectSections({
      root,
      raw,
      configFile,
      filesystem,
      context: {
        get(section) {
          return context.get(section);
        },
      },
    }),
    liveSections,
  );

  return context;
}
