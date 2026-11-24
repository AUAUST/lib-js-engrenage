import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Section } from "#foundation/options/index";
import { themeNamespaces } from "#tools/shopify/theme/preset/constants";
import type { Directories } from "#types/Directories";

/**
 * Creates the options section of the theme namespace `name`, placed on the
 * directory of its name with its namespace kind.
 *
 * @throws When `name` names no theme namespace.
 */
export function createNamespaceOptionsSection(
  name: string,
): Section<{ readonly dirs: Directories; readonly kind: string }> {
  const namespace = themeNamespaces.find((theme) => theme.name === name);

  if (namespace === undefined) {
    throw new Error(`No Shopify theme namespace is named ${name}`);
  }

  // @debt declares no option schema, so unlike a built-in environment's options a scope cannot move a theme namespace's directories or override its kind
  return declareSection({
    resolve() {
      return freeze({ dirs: freeze([name]), kind: namespace.kind });
    },
  });
}
