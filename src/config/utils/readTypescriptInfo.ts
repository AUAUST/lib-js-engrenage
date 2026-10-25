import { defaultTsconfigFile } from "#config/constants/defaultTsconfigFile";
import type { TypescriptInfo } from "#config/types/TypescriptInfo";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { readCompilerOptions } from "#typescript/utils/readCompilerOptions";
import { existsSync } from "node:fs";

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
