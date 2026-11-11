import { entries } from "@auaust/toolkit/object";

import { requiredScopes } from "#tools/github/issues/api/constants";

export function checkTokenScopes(header: string): void {
  const granted = new Set(header.split(",").map((scope) => scope.trim()));

  const missing = entries(requiredScopes)
    .filter(([, grants]) => !grants.some((grant) => granted.has(grant)))
    .map(([scope]) => scope);

  if (missing.length > 0) {
    throw new Error(
      `The GitHub token lacks the ${missing.join(", ")} scope: run \`gh auth refresh -s ${missing.join(",")}\``,
    );
  }
}
