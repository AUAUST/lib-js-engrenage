import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";

/**
 * Describes an option's flags as usage text and errors name it, such as
 * `-n, --note <value>`.
 *
 * @pure
 */
export function describeOptionFlags({
  name,
  type,
  short,
  placeholder = "value",
}: OptionDeclaration): string {
  const long = type === "string" ? `--${name} <${placeholder}>` : `--${name}`;

  return short === undefined ? long : `-${short}, ${long}`;
}
