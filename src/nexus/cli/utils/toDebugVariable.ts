import { toUpperCase } from "@auaust/toolkit/string";

/**
 * The environment variable turning debug on for the program named `name`: that
 * name in upper case followed by `_DEBUG`.
 *
 * @pure
 */
export function toDebugVariable(name: string): string {
  return `${toUpperCase(name)}_DEBUG`;
}
