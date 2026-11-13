import { map } from "@auaust/primitive-kit/arrays";
import { hasOwn } from "@auaust/toolkit/object";

import type { LoadedConfig } from "#project/config/index";
import type { Convention } from "#tools/eslint/types/Convention";

import * as builtInCategories from "#tools/eslint/conventions/index";

export async function loadConventionCategories(
  config: LoadedConfig,
): Promise<Readonly<Record<string, Readonly<Record<string, Convention>>>>> {
  const contributions = await config.context.registry.contributions(
    "eslint.conventions",
    config,
  );

  const loaded = await Promise.all(
    map(contributions, async ({ entry, extension }) => {
      return {
        entry,
        extension: extension.name,
        convention: await entry.load(),
      };
    }),
  );

  const owners = new Map<string, string>();

  const contributed: Record<string, Record<string, Convention>> = {};

  for (const { entry, extension, convention } of loaded) {
    const { category, name } = entry;

    if (hasOwn(builtInCategories, category)) {
      throw new Error(
        `Extension "${extension}" contributes conventions to the built-in ESLint category "${category}"`,
      );
    }

    const owner = owners.get(category);

    if (owner !== undefined && owner !== extension) {
      throw new Error(
        `Extensions "${owner}" and "${extension}" both contribute conventions to the ESLint category "${category}"`,
      );
    }

    owners.set(category, extension);

    const conventions: Record<
      string,
      Convention
    > = (contributed[category] ??= {});

    if (conventions[name] !== undefined) {
      throw new Error(
        `Extension "${extension}" contributes the ESLint convention "${category}.${name}" twice`,
      );
    }

    conventions[name] = convention;
  }

  return { ...builtInCategories, ...contributed };
}
