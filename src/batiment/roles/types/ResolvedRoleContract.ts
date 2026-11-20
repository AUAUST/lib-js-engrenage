import type { roleSurfaces } from "#batiment/roles/constants";
import type { ReexportMode } from "#batiment/roles/types/ReexportMode";
import type { ResolvedRoleExports } from "#batiment/roles/types/ResolvedRoleExports";
import type { RoleCompanionResolver } from "#batiment/roles/types/RoleCompanionResolver";
import type { RoleFileResolver } from "#batiment/roles/types/RoleFileResolver";
import type { RoleRules } from "#batiment/roles/types/RoleRules";
import type { DescribedResolver } from "#foundation/options/index";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

/**
 * A role's contract with every option of its preset and configuration resolved,
 * unset optional ones left `undefined`.
 *
 * @experimental
 */
export interface ResolvedRoleContract {
  readonly file: Glob | Globs | DescribedResolver<RoleFileResolver> | undefined;
  readonly companions: DescribedResolver<RoleCompanionResolver> | undefined;
  readonly accepts: Glob | Globs | undefined;
  readonly nesting: number | "any";
  readonly roles: readonly string[] | undefined;
  readonly categories: boolean | undefined;
  readonly exports: ResolvedRoleExports;
  readonly index: boolean | "root";
  readonly public: boolean;
  readonly subpath: boolean | "root";
  readonly reexport: readonly ReexportMode[] | undefined;
  readonly collected: boolean;
  readonly surface: (typeof roleSurfaces)[number];
  readonly discovered: boolean;
  readonly optIn: boolean;
  readonly strict: boolean;
  readonly typeOnly: boolean;
  readonly unique: boolean;
  readonly required: boolean;
  readonly effects: string | undefined;
  readonly purpose: string | undefined;
  readonly rules: RoleRules | undefined;
}
