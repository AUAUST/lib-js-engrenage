import { relative } from "node:path";

import {
  formatDiagnostics,
  getParsedCommandLineOfConfigFile,
  sys,
  type CompilerOptions,
  type Diagnostic,
  type FormatDiagnosticsHost,
} from "typescript";

import { once } from "@auaust/toolkit/once";

import { createAccessors } from "#config/utils/createAccessors";
import { isWithin } from "#support/filesystem/utils/isWithin";
import { toPosixPath } from "#support/filesystem/utils/toPosixPath";
import { noInputsDiagnostic } from "#typescript/constants";
import type { Filesystem } from "#config/types/Filesystem";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Paths } from "#typescript/types/Paths";
import type { Tsconfig } from "#typescript/types/Tsconfig";

const formatHost: FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: sys.getCurrentDirectory,
  getNewLine: () => sys.newLine,
};

function toError(diagnostics: readonly Diagnostic[]): Error {
  return new Error(formatDiagnostics(diagnostics, formatHost));
}

function parseTsconfig({
  root,
  path,
  filesystem,
}: {
  root: Directory;
  path: File;
  filesystem: Filesystem;
}): CompilerOptions {
  function readFile(file: File): string | undefined {
    return isWithin(root, file) ? filesystem.read(file) : sys.readFile(file);
  }

  function fileExists(file: File): boolean {
    return readFile(file) !== undefined;
  }

  const parsed = getParsedCommandLineOfConfigFile(path, undefined, {
    ...sys,
    readFile,
    fileExists,
    onUnRecoverableConfigFileDiagnostic(diagnostic) {
      throw toError([diagnostic]);
    },
  });

  if (!parsed) {
    throw new Error(`Unable to read ${path}`);
  }

  const errors = parsed.errors.filter(({ code }) => {
    return code !== noInputsDiagnostic;
  });

  if (errors.length > 0) {
    throw toError(errors);
  }

  return parsed.options;
}

export function createTsconfig({
  root,
  path,
  filesystem,
}: {
  root: Directory;
  path: File | undefined;
  filesystem: Filesystem;
}): Tsconfig {
  const compilerOptions = once(() => {
    return path === undefined
      ? undefined
      : parseTsconfig({
          root,
          path,
          filesystem,
        });
  });

  function outDir(): Directory | undefined {
    const configured = compilerOptions()?.outDir;

    if (configured === undefined) {
      return;
    }

    const relativeOutDir = toPosixPath(relative(root, configured));

    if (relativeOutDir === "") {
      throw new Error(
        `${path} sets compilerOptions.outDir to the project root ${root}`,
      );
    }

    return relativeOutDir;
  }

  function paths(): Paths | undefined {
    return compilerOptions()?.paths;
  }

  function describeMissing(field: string): string {
    return path === undefined
      ? `No tsconfig found in ${root}`
      : `${path} does not set compilerOptions.${field}`;
  }

  return createAccessors({
    resolvers: {
      compilerOptions,
      outDir,
      paths,
    },
    describeMissing,
  });
}
