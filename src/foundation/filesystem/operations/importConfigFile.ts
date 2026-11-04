import { loadConfig } from "c12";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export async function importConfigFile(directory: Directory, configFile: File) {
  return loadConfig({
    cwd: directory,
    configFile,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
    envName: false,
    extend: false,
    giget: false,
  });
}
