import { readdir } from "node:fs/promises";

import { isMissingError } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

export async function listAgentSessions(
  directory: Directory,
): Promise<readonly string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    if (isMissingError(error)) {
      return [];
    }

    throw error;
  }
}
