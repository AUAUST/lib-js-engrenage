import { packageJsonFile } from "#constants";
import { declareSection } from "#foundation/options/index";
import { locateFile, type ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

export const packageJsonPathSection = declareSection({
  name: "packageJsonPath",
  live: true,
  resolve(_input, config: ConfigResolver): Promise<File | undefined> {
    return locateFile(config.context, packageJsonFile, false);
  },
});
