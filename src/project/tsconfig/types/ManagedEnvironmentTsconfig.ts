import type { ManagedListOption } from "#project/config/types/ManagedListOption";
import type { ResolvedLocation } from "#project/config/types/ResolvedLocation";
import type { TsconfigEnvironment } from "#project/tsconfig/types/TsconfigEnvironment";

export interface ManagedEnvironmentTsconfig {
  readonly enabled: true;
  readonly path: ResolvedLocation;
  readonly inherits: TsconfigEnvironment | undefined;
  readonly extends: ManagedListOption<string> | undefined;
  readonly include: ManagedListOption<string> | undefined;
  readonly exclude: ManagedListOption<string> | undefined;
  readonly lib: ManagedListOption<string> | undefined;
  readonly types: ManagedListOption<string> | undefined;
  readonly compilerOptions: Readonly<Record<string, unknown>>;
  readonly unmanaged: readonly string[];
  readonly check: boolean;
}
