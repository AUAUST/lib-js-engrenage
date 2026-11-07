export interface ResolvedBuild {
  readonly clean: "all" | "emitted" | false;
  readonly sourcemap: boolean;
  readonly typed: boolean;
}
