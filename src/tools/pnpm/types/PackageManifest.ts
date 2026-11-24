import type { InferOutput } from "valibot";

import type { packageManifestSchema } from "#tools/pnpm/config/schemas/packageManifestSchema";

export type PackageManifest = InferOutput<typeof packageManifestSchema>;
