import type { InferOutput } from "valibot";

import type { packageSchema } from "#config/config/schemas/packageSchema";

export type PackageInfo = InferOutput<typeof packageSchema>;
