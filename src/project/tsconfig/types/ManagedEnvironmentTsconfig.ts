import type { ResolvedLocation } from "#foundation/options/index";
import type { ManagedTsconfigFields } from "#project/tsconfig/types/ManagedTsconfigFields";

export interface ManagedEnvironmentTsconfig extends ManagedTsconfigFields {
  readonly enabled: true;
  readonly path: ResolvedLocation;
  readonly inherits: string | undefined;
  readonly check: boolean;
}
