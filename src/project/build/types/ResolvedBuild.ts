import type { Directory } from "#types/Directory";

export interface ResolvedBuild {
  readonly configuredOutDir: Directory | undefined;
  readonly clean: "all" | "emitted" | false;
  readonly sourcemap: boolean;
  readonly typed: boolean;
}
