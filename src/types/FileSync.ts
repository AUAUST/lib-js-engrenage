import type { File } from "#types/File";

export interface FileSync {
  file: File;
  initial?: string;
  update: (content: string, path: File) => string;
}
