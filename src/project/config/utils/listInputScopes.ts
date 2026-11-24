import { freeze } from "@auaust/toolkit/object";

import { defaultKeyScope } from "#project/config/constants";
import type { Registry } from "#foundation/extensions/index";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";
import type { InputScope } from "#project/config/types/InputScope";

/**
 * The scope of each config input, by input name, with a key reading it in that
 * scope: `project` when every key reading it is a project key, else the scope
 * its other keys share.
 *
 * @throws When two keys reading one input declare different scopes, neither
 * of them `project`.
 */
export function listInputScopes(
  registry: Registry<Extension, ConfigResolver>,
): ReadonlyMap<string, InputScope> {
  const scopes = new Map<string, InputScope>();

  for (const { key, declaration } of registry.list("keys")) {
    const { input, scope = defaultKeyScope } = declaration;

    if (input === undefined) {
      continue;
    }

    const known = scopes.get(input);

    if (known === undefined || known.scope === "project") {
      scopes.set(input, freeze({ scope, key }));
    } else if (scope !== "project" && scope !== known.scope) {
      throw new Error(
        `Config keys "${known.key}" and "${key}" read input "${input}" in different scopes: ${known.scope} and ${scope}`,
      );
    }
  }

  return scopes;
}
