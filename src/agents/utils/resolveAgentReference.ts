import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";
import { resolveReference } from "#utils/resolveReference";
import { existsSync } from "node:fs";

function isRelative(reference: string): boolean {
  return reference.startsWith("./") || reference.startsWith("../");
}

function resolveSnippet(
  config: ResolvedConfig,
  reference: string,
): File | null {
  const { snippetsDirectory } = config.agents;

  if (snippetsDirectory === undefined || isRelative(reference)) {
    return null;
  }

  const snippet = config.resolve(snippetsDirectory, reference);

  return existsSync(snippet) ? snippet : null;
}

export function resolveAgentReference(
  config: ResolvedConfig,
  reference: string,
  from: File,
): File {
  const snippet = resolveSnippet(config, reference);

  if (snippet !== null) {
    return snippet;
  }

  try {
    return resolveReference(reference, from);
  } catch (error) {
    throw new Error(`Cannot resolve reference "${reference}" in ${from}`, {
      cause: error,
    });
  }
}
