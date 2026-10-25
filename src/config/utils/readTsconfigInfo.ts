import { existsSync } from "node:fs";

import { defaultTsconfigFile } from "#config/constants";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { readCompilerOptions } from "#typescript/utils/readCompilerOptions";
import type { TsconfigInfo } from "#config/types/TsconfigInfo";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function readTsconfigInfo({
  root,
  tsconfig,
  tsconfigPath,
}: {
  root: Directory;
  tsconfig: File;
  tsconfigPath: File;
}): TsconfigInfo {
  if (!existsSync(tsconfigPath)) {
    if (tsconfig === defaultTsconfigFile) {
      return {};
    }

    throw new Error(`The configured tsconfig ${tsconfigPath} does not exist`);
  }

  const { outDir, paths } = readCompilerOptions(tsconfigPath);

  return {
    outDir: outDir == null ? undefined : relativeWithin(root, outDir),
    paths,
  };
}
