import type { packageSchema } from "#config/config/schemas/packageSchema";
import type { InferOutput } from "valibot";

export type PackageInfo = InferOutput<typeof packageSchema>;
