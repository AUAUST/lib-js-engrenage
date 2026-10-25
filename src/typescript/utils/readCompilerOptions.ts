import {
  formatDiagnostics,
  getParsedCommandLineOfConfigFile,
  sys,
  type CompilerOptions,
  type Diagnostic,
  type FormatDiagnosticsHost,
} from "typescript";

import { resolve } from "#support/filesystem/utils/resolve";
import type { File } from "#types/File";

const formatHost: FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: sys.getCurrentDirectory,
  getNewLine: () => sys.newLine,
};

function toError(diagnostics: readonly Diagnostic[]): Error {
  return new Error(formatDiagnostics(diagnostics, formatHost));
}

export function readCompilerOptions(tsconfig: File | URL): CompilerOptions {
  const tsconfigPath = resolve(tsconfig);

  const parsed = getParsedCommandLineOfConfigFile(tsconfigPath, undefined, {
    ...sys,
    onUnRecoverableConfigFileDiagnostic(diagnostic) {
      throw toError([diagnostic]);
    },
  });

  if (!parsed) {
    throw new Error(`Unable to read ${tsconfigPath}`);
  }

  if (parsed.errors.length > 0) {
    throw toError(parsed.errors);
  }

  return parsed.options;
}
