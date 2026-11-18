import { isString } from "@auaust/toolkit";

import { parseRepository } from "#tools/github/utils/parseRepository";

export function parseManifestRepository(
  repository: string | { url: string } | undefined,
): string | undefined {
  if (repository !== undefined) {
    return parseRepository(isString(repository) ? repository : repository.url);
  }
}
