import { existsSync } from "node:fs";
import { createRequire } from "node:module";

import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { File } from "#types/File";

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
    return createRequire(from).resolve(reference);
  } catch (error) {
    throw new Error(`Cannot resolve reference "${reference}" in ${from}`, {
      cause: error,
    });
  }
}
