import { map } from "@auaust/toolkit/array";

import { bundledImportExtensions } from "#tools/typescript/constants";

export function createBundledImport(stem: string) {
  return {
    types: map(bundledImportExtensions, (extension) => `${stem}${extension}`),
    default: stem,
  };
}
