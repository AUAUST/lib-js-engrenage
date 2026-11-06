// @debt this static `typescript` import runs wherever the `tsconfig` index loads, which every config load does, so commands that never read a tsconfig (`gate`, `debt`, agent hooks) still parse the compiler (~0.2 s per process).
import { relative, resolve } from "node:path";

import {
  formatDiagnostics,
  getParsedCommandLineOfConfigFile,
  sys,
  type Diagnostic,
  type FormatDiagnosticsHost,
  type ParseConfigFileHost,
  type ParsedCommandLine,
} from "typescript";

import { map } from "@auaust/primitive-kit/arrays";
import { once } from "@auaust/toolkit/once";

import {
  isWithin,
  readTextFile,
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
  path,
  files,
}: {
  path: File;
  files: ReadonlyMap<File, string | undefined>;
}): ParsedCommandLine {
  const host: ParseConfigFileHost = {
    useCaseSensitiveFileNames: sys.useCaseSensitiveFileNames,
    getCurrentDirectory: sys.getCurrentDirectory,
    readDirectory: () => [],
    readFile: (file) => files.get(resolve(file)),
    fileExists: (file) => files.get(resolve(file)) !== undefined,
    onUnRecoverableConfigFileDiagnostic(diagnostic) {
      throw toError([diagnostic]);
    },
  };

  const parsed = getParsedCommandLineOfConfigFile(path, undefined, host);

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

// @debt the TypeScript config parser reads files synchronously, so each `extends` level costs a probing parse before the real one; an async parser would read each file once
async function loadTsconfigFiles({
  root,
  path,
  filesystem,
  content,
}: {
  root: Directory;
  path: File;
  filesystem: Filesystem;
  content: string | undefined;
}): Promise<ReadonlyMap<File, string | undefined>> {
  const files = new Map<File, string | undefined>();

  if (content !== undefined) {
    files.set(resolve(path), content);
  }

  for (;;) {
    const missing = new Set<File>();

    const probe = (file: File) => {
      const located = resolve(file);

      if (!files.has(located)) {
        missing.add(located);
      }

      return files.get(located);
    };

    try {
      getParsedCommandLineOfConfigFile(path, undefined, {
        useCaseSensitiveFileNames: sys.useCaseSensitiveFileNames,
        getCurrentDirectory: sys.getCurrentDirectory,
        readDirectory: () => [],
        readFile: probe,
        fileExists: (file) => probe(file) !== undefined,
        onUnRecoverableConfigFileDiagnostic() {},
      });
    } catch {
      // the probing pass only discovers files: invalid content surfaces in the real parse
    }

    if (missing.size === 0) {
      return files;
    }

    await Promise.all(
      [...missing].map(async (file) => {
        files.set(
          file,
          isWithin(root, file)
            ? await filesystem.read(file)
            : await readTextFile(file),
        );
      }),
    );
  }
}

export async function createTsconfig({
  root,
  path,
  filesystem,
  content,
}: {
  root: Directory;
  path: File | undefined;
  filesystem: Filesystem;
  content?: string | undefined;
}): Promise<Tsconfig> {
  const files =
    path === undefined
      ? undefined
      : await loadTsconfigFiles({
          root,
          path,
          filesystem,
          content,
        });

  const parsed = once(() => {
    return path === undefined || files === undefined
      ? undefined
      : parseTsconfig({ path, files });
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
