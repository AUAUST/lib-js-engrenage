import { relative, resolve } from "node:path";

import {
  formatDiagnostics,
  getParsedCommandLineOfConfigFile,
  sys,
  type Diagnostic,
  type FormatDiagnosticsHost,
  type ParsedCommandLine,
} from "typescript";

import { map } from "@auaust/primitive-kit/arrays";
import { once } from "@auaust/toolkit/once";

import {
  isWithin,
  toPosixPath,
  type Filesystem,
} from "#foundation/filesystem/index";
import { createAccessors } from "#foundation/options/index";
import { noInputsDiagnostic } from "#project/tsconfig/constants";
import type { Paths } from "#project/tsconfig/types/Paths";
import type { Tsconfig } from "#project/tsconfig/types/Tsconfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

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
  content,
}: {
  root: Directory;
  path: File;
  filesystem: Filesystem;
  content: string | undefined;
}): ParsedCommandLine {
  function readFile(file: File): string | undefined {
    if (content !== undefined && resolve(file) === resolve(path)) {
      return content;
    }

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

  return parsed;
}

export function createTsconfig({
  root,
  path,
  filesystem,
  content,
}: {
  root: Directory;
  path: File | undefined;
  filesystem: Filesystem;
  content?: string | undefined;
}): Tsconfig {
  const parsed = once(() => {
    return path === undefined
      ? undefined
      : parseTsconfig({
          root,
          path,
          filesystem,
          content,
        });
  });

  function compilerOptions() {
    return parsed()?.options;
  }

  function references(): readonly File[] {
    return map(parsed()?.projectReferences ?? [], ({ path }) => {
      return path;
    });
  }

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
      references,
    },
    describeMissing,
  });
}
