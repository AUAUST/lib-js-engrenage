import { posix } from "node:path";

import {
  createCompilerHost,
  createProgram,
  createSourceFile,
  getDefaultLibFilePath,
  ModuleKind,
  ScriptTarget,
  type CompilerOptions,
  type Diagnostic,
  type SourceFile,
} from "typescript";

import { filter, join, map } from "@auaust/primitive-kit/arrays";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const sourcesRoot = "/__engrenage_sources__";

const compilerOptions = {
  types: [],
  noEmit: true,
  target: ScriptTarget.ESNext,
  module: ModuleKind.ESNext,
} satisfies CompilerOptions;

export function createLibraryCompiler(libraries?: Directory) {
  const host = createCompilerHost(compilerOptions);

  const files = new Map<string, SourceFile | undefined>();

  const sources = new Map<string, SourceFile>();

  const { getSourceFile } = host;

  const location =
    libraries ?? posix.dirname(getDefaultLibFilePath(compilerOptions));

  // @debt the sources of the running compilation reach the shared host through this mutable binding, which holds only while compilations stay synchronous and never interleave.
  let current: ReadonlyMap<File, string> = new Map();

  host.getDefaultLibLocation = () => location;

  function readSource(fileName: string): SourceFile | undefined {
    const text = current.get(posix.relative(sourcesRoot, fileName));

    if (text === undefined) {
      return;
    }

    const known = sources.get(fileName);

    if (known?.text === text) {
      return known;
    }

    const source = createSourceFile(fileName, text, ScriptTarget.ESNext, true);

    sources.set(fileName, source);

    return source;
  }

  host.getSourceFile = (fileName, ...rest) => {
    if (fileName.startsWith(`${sourcesRoot}/`)) {
      return readSource(fileName);
    }

    if (!files.has(fileName)) {
      files.set(fileName, getSourceFile(fileName, ...rest));
    }

    return files.get(fileName);
  };

  function listLibraryFiles(names: readonly string[]): Set<string> {
    const found = new Set<string>();

    const queue = [...names];

    while (queue.length > 0) {
      const name = queue.pop();

      const fileName = posix.join(location, `lib.${name}.d.ts`);

      if (found.has(fileName)) {
        continue;
      }

      found.add(fileName);

      const source = host.getSourceFile(fileName, ScriptTarget.ESNext);

      queue.push(
        ...map(
          source?.libReferenceDirectives ?? [],
          ({ fileName }) => fileName,
        ),
      );
    }

    return found;
  }

  function compile({
    lib,
    trusted,
    sources: given,
    entry,
  }: {
    lib: readonly string[];
    trusted: readonly string[];
    sources: ReadonlyMap<File, string>;
    entry: File;
  }): Diagnostic | undefined {
    if (!given.has(entry)) {
      throw new Error(`The entry ${entry} is not among the compiled sources`);
    }

    const untrusted = filter(trusted, (name) => !lib.includes(name));

    if (untrusted.length > 0) {
      throw new Error(
        `The trusted libs ${join(untrusted, ", ")} are not among the compiled libs`,
      );
    }

    const skipped = listLibraryFiles(trusted);

    current = given;

    const program = createProgram({
      rootNames: [posix.join(sourcesRoot, entry)],
      options: {
        ...compilerOptions,
        lib: map(lib, (name) => `lib.${name}.d.ts`),
      },
      host,
    });

    const [first] = [
      ...program.getOptionsDiagnostics(),
      ...program.getGlobalDiagnostics(),
      // @debt native flatMap is used because primitive-kit's filter types its result as an array of the input array; the same typing issue affects the filter(groups, …) call in generateApiDeclarations
      ...program.getSourceFiles().flatMap((file) => {
        if (skipped.has(file.fileName)) {
          return [];
        }

        return [
          ...program.getSyntacticDiagnostics(file),
          ...program.getSemanticDiagnostics(file),
        ];
      }),
    ];

    return first;
  }

  return { compile };
}
