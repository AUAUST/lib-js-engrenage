import { declareSection } from "#foundation/options/index";
import { locateTsconfigPath } from "#project/tsconfig/operations/locateTsconfigPath";
import type { ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

export const tsconfigPathSection = declareSection({
  live: true,
  resolve(_input, config: ConfigResolver): Promise<File | undefined> {
    return locateTsconfigPath(config);
  },
});
