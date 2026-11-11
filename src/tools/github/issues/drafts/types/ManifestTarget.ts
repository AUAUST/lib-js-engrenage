import type { GithubSnapshot } from "#tools/github/issues/api/index";

export interface ManifestTarget {
  readonly repository: string;
  readonly labels: readonly string[];
  readonly types: readonly {
    readonly name: string;
    readonly fields: readonly GithubSnapshot["organizations"][string]["fields"][number][];
  }[];
}
