import { packageJsonFile } from "#constants";
import { declareSection, type Resolver } from "#foundation/options/index";
import { locateFile, type ConfigContext } from "#project/config/index";

export const packageJsonPathSection = declareSection({
  name: "packageJsonPath",
  live: true,
  resolve(_input, config: Resolver<ConfigContext>) {
    return locateFile(config.context, packageJsonFile, false);
  },
});
