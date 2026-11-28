import { relative, resolve } from "node:path";

import type {
  Diagnostic,
  formatDiagnostics,
  FormatDiagnosticsHost,
  getParsedCommandLineOfConfigFile,
  ParseConfigFileHost,
  ParsedCommandLine,
  sys,
} from "typescript";

import { pluck } from "@auaust/toolkit/array";
import { once } from "@auaust/toolkit/function";

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

interface Compiler {
  readonly formatDiagnostics: typeof formatDiagnostics;
  readonly getParsedCommandLineOfConfigFile: typeof getParsedCommandLineOfConfigFile;
  readonly sys: typeof sys;
}

function toError(
  { formatDiagnostics, sys }: Compiler,
  diagnostics: readonly Diagnostic[],
): Error {
  const host: FormatDiagnosticsHost = {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: sys.getCurrentDirectory,
    getNewLine: () => sys.newLine,
  };

  return new Error(formatDiagnostics(diagnostics, host));
}

function parseTsconfig(
  compiler: Compiler,
  {
    path,
    files,
  }: {
    path: File;
    files: ReadonlyMap<File, string | undefined>;
  },
): ParsedCommandLine {
  const { getParsedCommandLineOfConfigFile, sys } = compiler;

  const host: ParseConfigFileHost = {
    useCaseSensitiveFileNames: sys.useCaseSensitiveFileNames,
    getCurrentDirectory: sys.getCurrentDirectory,
    readDirectory: () => [],
    readFile: (file) => files.get(resolve(file)),
    fileExists: (file) => files.get(resolve(file)) !== undefined,
    onUnRecoverableConfigFileDiagnostic(diagnostic) {
      throw toError(compiler, [diagnostic]);
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
    throw toError(compiler, errors);
  }

  return parsed;
}

// @debt the TypeScript config parser reads files synchronously, so each `extends` level costs a probing parse before the real one; an async parser would read each file once
async function loadTsconfigFiles(
  { getParsedCommandLineOfConfigFile, sys }: Compiler,
  {
    root,
    path,
    filesystem,
    content,
  }: {
    root: Directory;
    path: File;
    filesystem: Filesystem;
    content: string | undefined;
  },
): Promise<ReadonlyMap<File, string | undefined>> {
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

async function readTsconfig(input: {
  root: Directory;
  path: File;
  filesystem: Filesystem;
  content: string | undefined;
}): Promise<() => ParsedCommandLine> {
  const compiler = await import("typescript");

  const files = await loadTsconfigFiles(compiler, input);

  return once(() => {
    return parseTsconfig(compiler, { path: input.path, files });
  });
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
  const parsed = path === undefined
    ? undefined
    : await readTsconfig({
        root,
        path,
        filesystem,
        content,
      });

  function compilerOptions() {
    return parsed?.().options;
  }

  function references(): readonly File[] {
    return pluck(parsed?.().projectReferences, "path") ?? [];
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
