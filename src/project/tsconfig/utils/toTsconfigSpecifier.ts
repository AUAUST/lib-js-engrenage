import { relativeToTsconfig } from "#project/tsconfig/utils/relativeToTsconfig";
import type { File } from "#types/File";

export function toTsconfigSpecifier(tsconfig: File, target: string): string {
  const relative = relativeToTsconfig(tsconfig, target);

  return relative.startsWith("..") ? relative : `./${relative}`;
}
