import { basename } from "node:path";

import {
  domainMetadataFile,
  namespaceMetadataFile,
} from "#batiment/scopes/constants";
import type { File } from "#types/File";

export function listStrayFiles(
  assigned: readonly (readonly [File, string | undefined])[],
): File[] {
  return assigned
    .filter(([file, role]) => {
      const name = basename(file);

      return (
        role === undefined &&
        name !== namespaceMetadataFile &&
        name !== domainMetadataFile
      );
    })
    .map(([file]) => file);
}
