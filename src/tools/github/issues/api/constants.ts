import { freeze } from "@auaust/toolkit/object";

export const githubApiVersion = "2022-11-28";

export const scopesHeader = "x-oauth-scopes";

export const requiredScopes = freeze({
  "repo": freeze(["repo"] as const),
  "read:org": freeze(["read:org", "write:org", "admin:org"] as const),
} as const);
