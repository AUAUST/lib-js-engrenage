import {
  declarationExtension,
  tsxExtensions,
  typescriptExtensions,
} from "#tools/typescript/constants";
import type { File } from "#types/File";

export function isModule(file: File): boolean {
  return (
    !file.endsWith(declarationExtension) &&
    [...typescriptExtensions, ...tsxExtensions].some((extension) => {
      return file.endsWith(extension);
    })
  );
}
