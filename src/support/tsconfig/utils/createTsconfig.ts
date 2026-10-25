import { constant } from "@auaust/toolkit/constant";
import { on } from "@auaust/toolkit/on";
import { once } from "@auaust/toolkit/once";

import { createAccessors } from "#support/accessors/builders/createAccessors";
import { relativeWithin } from "#support/filesystem/utils/relativeWithin";
import { parseTsconfig } from "#support/tsconfig/utils/parseTsconfig";
import type { Tsconfig } from "#support/tsconfig/types/Tsconfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export function createTsconfig({
  root,
  path,
}: {
  root: Directory;
  path: File | undefined;
}): Tsconfig {
  const compilerOptions = once(() => {
    return path === undefined ? undefined : parseTsconfig(path);
  });

  const outDir = once(() => {
    return on(compilerOptions, (options) => {
      return options?.outDir === undefined
        ? undefined
        : relativeWithin(root, options.outDir);
    });
  });

  const paths = once(() => {
    return on(compilerOptions, (options) => {
      return options?.paths;
    });
  });

  function describeMissing(field: string): string {
    return path === undefined
      ? `No tsconfig found in ${root}`
      : `${path} does not set compilerOptions.${field}`;
  }

  return createAccessors({
    resolvers: {
      path: constant(path),
      compilerOptions,
      outDir,
      paths,
    },
    describeMissing,
  });
}
