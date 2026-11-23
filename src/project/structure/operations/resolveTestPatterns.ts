import { listNamespaces } from "#batiment/scopes/index";
import { composeVariantPatterns } from "#project/environments/index";
import type { ConfigResolver } from "#project/config/index";
import type { Globs } from "#types/Globs";

/**
 * Resolves the file patterns of each test variant the project's namespace kinds
 * declare, by variant name.
 */
export async function resolveTestPatterns(
  config: ConfigResolver,
): Promise<Readonly<Partial<Record<string, Globs>>>> {
  const [option, tree] = await Promise.all([
    config.resolve("tests.options"),
    config.resolve("scopes"),
  ]);

  // @debt every kind's variants take their location from the tests environment's options, so a variant kind placed outside `tests.options.location` matches no file
  const variants = listNamespaces(tree).flatMap(({ kind }) => {
    return kind.variants ?? [];
  });

  return composeVariantPatterns(option, variants);
}
