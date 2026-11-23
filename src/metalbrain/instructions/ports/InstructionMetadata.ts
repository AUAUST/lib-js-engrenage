import type { EntryShape } from "#foundation/extensions/index";
import type { MetalbrainFacts } from "#metalbrain/facts/index";

/**
 * What every instruction registry entry declares about its Markdown body, the
 * `./metalbrain/<kind>s/<name>.md` export of the package registering it.
 */
export interface InstructionMetadata extends EntryShape {
  /**
   * The body's file stem, unique within its kind across the registry.
   */
  readonly name: string;
  /**
   * The group selection prompts show the instruction under.
   */
  readonly category: string;
  /**
   * Whether init and selection prompts select the instruction by default.
   */
  readonly default?: boolean;
  /**
   * Whether the instruction applies to the project the facts describe; it always
   * applies without one.
   */
  when?(facts: MetalbrainFacts): boolean;
}
