import type { fetchRepositoryLabels } from "#tools/github/issues/api/operations/fetchRepositoryLabels";

export type RepositoryLabel = Awaited<
  ReturnType<typeof fetchRepositoryLabels>
>[number];
