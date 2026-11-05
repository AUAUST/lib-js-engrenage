import type { Directory } from "#types/Directory";

export interface ResolvedBuild {
  readonly clean: "all" | "emitted" | false;
  readonly sourcemap: boolean;
  readonly typed: boolean;
  readonly outDir: Promise<Directory | undefined>;
}
