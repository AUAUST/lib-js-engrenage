import {
  formatDiagnostics,
  getParsedCommandLineOfConfigFile,
  sys,
  type CompilerOptions,
  type Diagnostic,
  type FormatDiagnosticsHost,
} from "typescript";

import type { File } from "#types/File";

const formatHost: FormatDiagnosticsHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: sys.getCurrentDirectory,
  getNewLine: () => sys.newLine,
};

function toError(diagnostics: readonly Diagnostic[]): Error {
  return new Error(formatDiagnostics(diagnostics, formatHost));
}

export function parseTsconfig(path: File): CompilerOptions {
  const parsed = getParsedCommandLineOfConfigFile(path, undefined, {
    ...sys,
    onUnRecoverableConfigFileDiagnostic(diagnostic) {
      throw toError([diagnostic]);
    },
  });

  if (!parsed) {
    throw new Error(`Unable to read ${path}`);
  }

  if (parsed.errors.length > 0) {
    throw toError(parsed.errors);
  }

  return parsed.options;
}
