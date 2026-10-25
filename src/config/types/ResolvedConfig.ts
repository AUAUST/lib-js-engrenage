import type { InferOutput } from "valibot";

import type { configSchema } from "#config/config/schemas/configSchema";
import type { PackageInfo } from "#config/types/PackageInfo";
import type { TsconfigInfo } from "#config/types/TsconfigInfo";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface ResolvedConfig extends InferOutput<typeof configSchema> {
  root: Directory;
  packagePath: File;
  tsconfigPath: File;
  gitignorePath: File;
  package: PackageInfo;
  tsconfig: TsconfigInfo;
  resolve(...paths: string[]): string;
}
