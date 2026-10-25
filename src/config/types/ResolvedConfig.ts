import type { InferOutput } from "valibot";

import type { configSchema } from "#config/config/schemas/configSchema";
import type { PackageInfo } from "#config/types/PackageInfo";
import type { TypescriptInfo } from "#config/types/TypescriptInfo";
import type { Directory } from "#types/Directory";

export interface ResolvedConfig extends InferOutput<typeof configSchema> {
  root: Directory;
  package: PackageInfo;
  typescript: TypescriptInfo;
  resolve(...paths: string[]): string;
}
