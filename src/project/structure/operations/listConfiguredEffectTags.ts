import { listEffectTags, type TagDeclaration } from "#project/docs/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * Declares the effect doc tags over the configured effect levels.
 */
export async function listConfiguredEffectTags(
  config: ConfigResolver,
): Promise<readonly TagDeclaration[]> {
  const { levels } = await config.resolve("effects");

  return listEffectTags(levels);
}
