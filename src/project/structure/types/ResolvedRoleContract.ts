import type { RoleFileResolver, RoleRules } from "#project/roles/index";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export interface ResolvedRoleContract {
  readonly file: Glob | Globs | RoleFileResolver | undefined;
  readonly fileDescription: string | undefined;
  readonly accepts: Glob | Globs | undefined;
  readonly nesting: number | "any";
  readonly roles: readonly string[] | undefined;
  readonly categories: boolean | undefined;
  readonly exports: "named-match" | "named" | "default" | undefined;
  readonly index: boolean;
  readonly public: boolean;
  readonly discovered: boolean;
  readonly lazy: boolean;
  readonly scoped: boolean;
  readonly strict: boolean;
  readonly typeOnly: boolean;
  readonly unique: boolean;
  readonly required: boolean;
  readonly effects: string | undefined;
  readonly purpose: string | undefined;
  readonly rules: RoleRules | undefined;
}
