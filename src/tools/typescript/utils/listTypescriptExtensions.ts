import { validate } from "#foundation/options/index";
import { typescriptOptionsSchema } from "#tools/typescript/config/schemas/typescriptOptionsSchema";
import { tsxExtensions } from "#tools/typescript/constants";

/**
 * The extensions TypeScript's options add to its own: `.tsx` once `tsx` names a
 * JSX flavour, and each extension `moduleExtensions` lists.
 *
 * @throws When the options are not TypeScript's.
 */
export function listTypescriptExtensions(
  options: Readonly<Record<string, unknown>>,
): readonly string[] {
  const {
    tsx,
    moduleExtensions = [],
  } = validate(typescriptOptionsSchema, options, "TypeScript language options");

  return [...(tsx === undefined ? [] : tsxExtensions), ...moduleExtensions];
}
