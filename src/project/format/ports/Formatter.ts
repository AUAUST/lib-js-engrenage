import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

export type Formatter = (
  content: string,
  options: { path: File; config: LoadedConfig },
) => Promise<string | undefined>;
