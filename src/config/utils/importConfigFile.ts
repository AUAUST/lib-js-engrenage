import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { loadConfig } from "c12";

export async function importConfigFile(
  root: Directory,
  configFile: File,
): Promise<unknown> {
  const { config } = await loadConfig({
    cwd: root,
    configFile,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
    envName: false,
    extend: false,
    giget: false,
    configFileRequired: true,
  });

  return config;
}
