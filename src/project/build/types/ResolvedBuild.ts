import type { Directory } from "#types/Directory";

export interface ResolvedBuild {
  readonly emptyOutDir: boolean;
  readonly sourcemap: boolean;
  readonly typed: boolean;
  readonly outDir: Directory | undefined;
}
