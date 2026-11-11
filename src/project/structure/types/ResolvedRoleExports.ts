// @debt the axis styles repeat the `exports` picklists of `declareRoleContractEntries` instead of being inferred from them
/** @experimental */
export interface ResolvedRoleExports {
  readonly values: "named-match" | "named" | "default" | "none" | undefined;
  readonly types: "named-match" | "named" | "none" | undefined;
}
