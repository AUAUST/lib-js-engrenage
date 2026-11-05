import { resolveModulePath } from "exsolve";

import { pathExists } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function isRelative(reference: string): boolean {
  return reference.startsWith("./") || reference.startsWith("../");
}

async function resolveSnippet(
  resolve: (...paths: string[]) => string,
  snippetsDir: Directory | undefined,
  reference: string,
): Promise<File | null> {
  if (snippetsDir === undefined || isRelative(reference)) {
    return null;
  }

  const snippet = resolve(snippetsDir, reference);

  return (await pathExists(snippet)) ? snippet : null;
}

// @debt `resolveModulePath` of exsolve resolves package specifiers synchronously
export async function resolveAgentReference(
  {
    resolve,
    agents,
  }: {
    resolve(...paths: string[]): string;
    agents: { snippetsDir: Directory | undefined };
  },
  reference: string,
  from: File,
): Promise<File> {
  const snippet = await resolveSnippet(resolve, agents.snippetsDir, reference);

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
