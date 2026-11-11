import {
  declarationExtension,
  typescriptExtensions,
} from "#tools/typescript/constants";
import type { File } from "#types/File";

export function isModule(file: File): boolean {
  return (
    !file.endsWith(declarationExtension) &&
    typescriptExtensions.some((extension) => file.endsWith(extension))
  );
}
