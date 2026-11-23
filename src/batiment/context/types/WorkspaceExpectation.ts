import type { OptionSource } from "#batiment/report/index";
import type { Glob } from "#types/Glob";

export interface WorkspaceExpectation {
  readonly glob: Glob;
  readonly purpose?: { readonly value: string; readonly config: OptionSource };
}
