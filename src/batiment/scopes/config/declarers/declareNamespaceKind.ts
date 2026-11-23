import { string } from "valibot";

import { declare, unset } from "#foundation/options/index";

export function declareNamespaceKind(
  explain = "the namespace kind named like the environment; a `kind` in its `.namespace.json` overrides it",
) {
  return declare(string(), {
    description: "The namespace kind the top-level namespace takes, naming a `namespaceKinds` entry giving its boundary facts.",
    optional: unset(explain),
  });
}
