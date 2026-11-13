import type { Extension } from "#project/config/index";

/**
 * Returns `extension` unchanged, typing it as an extension while keeping its
 * literal types.
 *
 * @stable
 */
export function defineExtension<const Defined extends Extension>(
  extension: Defined,
): Defined {
  return extension;
}
