import { typescript as name } from "#tools/typescript/constants";
import type { LanguageSelection } from "#batiment/environments/index";
import type { TypescriptOptions } from "#tools/typescript/types/TypescriptOptions";

/**
 * Selects the TypeScript language with options, in place of its
 * name in an environment preset's or registration's `languages`:
 * `typescript({ tsx: "solid" })` adds `.tsx` files and their JSX setup.
 */
export function typescript(options: TypescriptOptions): LanguageSelection {
  return { name, options };
}
