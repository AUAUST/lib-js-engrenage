import type { TypescriptInfo } from "#config/types/TypescriptInfo";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { resolve } from "#support/filesystem/utils/resolve";
import type { Directory } from "#types/Directory";
import { readCompilerOptions } from "#typescript/utils/readCompilerOptions";
import { existsSync } from "node:fs";

export function readTypescriptInfo(root: Directory): TypescriptInfo {
  const path = resolve(root, "tsconfig.json");

  if (!existsSync(path)) {
    return {};
  }

  const { outDir, paths } = readCompilerOptions(path);

  return {
    outDir: outDir == null ? undefined : relativeWithin(root, outDir),
    paths,
  };
}
