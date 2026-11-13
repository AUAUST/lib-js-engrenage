import type { Extension } from "#project/config/index";

/**
 * @stable
 */
export function defineExtension<const Defined extends Extension>(
  extension: Defined,
): Defined {
  return extension;
}
