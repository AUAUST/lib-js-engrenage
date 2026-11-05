import type { Files } from "#types/Files";
import type { GateResult } from "#workflows/gate/types/GateResult";

export interface GateStep {
  readonly name: string;
  run(files: Files): Promise<GateResult>;
}
