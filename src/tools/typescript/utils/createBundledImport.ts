import { map } from "@auaust/toolkit/array";

export function createBundledImport(
  stem: string,
  extensions: readonly string[],
) {
  return {
    types: map(extensions, (extension) => `${stem}${extension}`),
    default: stem,
  };
}
