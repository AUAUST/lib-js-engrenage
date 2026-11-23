import type { InferOutput } from "valibot";

import type { environmentMetadataSchema } from "#batiment/environments/config/schemas/environmentMetadataSchema";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export interface DiscoveredEnvironment {
  readonly dir: Directory;
  readonly file: File;
  readonly kind?: string;
  readonly languages?: readonly string[];
  readonly namespace: Omit<
    InferOutput<typeof environmentMetadataSchema>,
    "$schema" | "kind" | "languages"
  >;
}
