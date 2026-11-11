import type { InferOutput } from "valibot";

import type { githubSnapshotSchema } from "#tools/github/issues/api/config/schemas/githubSnapshotSchema";

export type GithubSnapshot = InferOutput<typeof githubSnapshotSchema>;
