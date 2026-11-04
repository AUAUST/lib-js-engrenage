import { existsSync } from "node:fs";

import { resolveModulePath } from "exsolve";

import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function isRelative(reference: string): boolean {
  return reference.startsWith("./") || reference.startsWith("../");
}

function resolveSnippet(
  resolve: (...paths: string[]) => string,
  snippetsDir: Directory | undefined,
  reference: string,
): File | null {
  if (snippetsDir === undefined || isRelative(reference)) {
    return null;
  }

  const snippet = resolve(snippetsDir, reference);

  return existsSync(snippet) ? snippet : null;
}

export function resolveAgentReference(
  {
    resolve,
    agents,
  }: {
    resolve(...paths: string[]): string;
    agents: { snippetsDir: Directory | undefined };
  },
  reference: string,
  from: File,
): File {
  const snippet = resolveSnippet(resolve, agents.snippetsDir, reference);

  if (snippet !== null) {
    return snippet;
  }

  try {
    return resolveModulePath(reference, { from });
  } catch (error) {
    throw new Error(`Cannot resolve reference "${reference}" in ${from}`, {
      cause: error,
    });
  }
}
