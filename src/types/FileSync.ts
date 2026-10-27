import type { File } from "#types/File";

export interface FileSync {
  file: File;
  update(content: string, path: File): string;
}
