import { existsSync } from "node:fs";

import { defaultTsconfigFile } from "#config/constants";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { resolve } from "#support/filesystem/utils/resolve";
import { readCompilerOptions } from "#typescript/utils/readCompilerOptions";
import type { TypescriptInfo } from "#config/types/TypescriptInfo";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function readTypescriptInfo(
  root: Directory,
  tsconfig: File,
): TypescriptInfo {
  const path = resolve(root, tsconfig);

  if (!existsSync(path)) {
    if (tsconfig === defaultTsconfigFile) {
      return {};
    }

    throw new Error(`The configured tsconfig ${path} does not exist`);
  }

  const { outDir, paths } = readCompilerOptions(path);

  return {
    outDir: outDir == null ? undefined : relativeWithin(root, outDir),
    paths,
  };
}
