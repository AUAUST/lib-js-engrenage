import type { BlockSyntax } from "#types/BlockSyntax";

/**
 * The marker line of a directive with its arguments in a block syntax.
 */
export function formatBlockMarker(
  { open, close }: BlockSyntax,
  directive: string,
  args: readonly string[] = [],
): string {
  return `${open}@${directive}${args.map((arg) => ` ${arg}`).join("")}${close}`;
}
